package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	webauth "github.com/mrshanahan/notes-web/internal/auth"
	"golang.org/x/oauth2"
)

// TODO: Is this how we even want to construct this?

var (
	OriginUrlCookieName = "origin_url"
)

func InjectDisableAuth(disableAuth bool) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		c.Locals("disableAuth", disableAuth)
		return c.Next()
	}
}

func LoginController(c *fiber.Ctx) error {
	originUrl := c.Query(OriginUrlCookieName)
	if originUrl == "" {
		originUrl = "/" // TODO: Constant/pass this in/truncate URL path
	}

	disableAuth := c.Locals("disableAuth").(bool)
	if disableAuth {
		slog.Warn("auth is disabled; setting cookie & ignoring")

		c.Cookie(&fiber.Cookie{
			Name:  webauth.AccessTokenCookieName,
			Value: "AUTH_DISABLED",
		})

		return c.Redirect(originUrl)
	}

	refreshTokenStr := c.Cookies("refresh_token")
	if refreshTokenStr != "" {
		tokenUrl := webauth.AuthConfig.LoginConfig.Endpoint.TokenURL
		form := url.Values{
			"grant_type":    []string{"refresh_token"},
			"client_id":     []string{webauth.AuthConfig.LoginConfig.ClientID},
			"refresh_token": []string{refreshTokenStr},
		}
		req, err := http.NewRequestWithContext(c.Context(), http.MethodPost, tokenUrl, strings.NewReader(form.Encode()))
		if err != nil {
			slog.Error("failed to create refresh token request", "err", err)
			return err
		}
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			slog.Error("failed to send refresh token request", "err", err)
			return err
		}
		// resp, err := http.PostForm(tokenUrl, form)
		respBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			slog.Error("failed to read refresh token response", "err", err)
			return err
		}

		if resp.StatusCode != 200 {
			deleteCookie(c, webauth.RefreshTokenCookieName)
			goto login
		}
		token := &oauth2.Token{}
		if err = json.Unmarshal(respBytes, token); err != nil {
			slog.Error("failed to parse refresh token response", "err", err)
			return err
		}

		c.Cookie(&fiber.Cookie{
			Name:  webauth.AccessTokenCookieName,
			Value: token.AccessToken,
		})
		c.Cookie(&fiber.Cookie{
			Name:  webauth.RefreshTokenCookieName,
			Value: token.RefreshToken,
		})

		return c.Redirect(originUrl)
	}

login:

	url := webauth.AuthConfig.LoginConfig.AuthCodeURL("randomstate")

	c.Cookie(&fiber.Cookie{
		Name:  OriginUrlCookieName,
		Value: originUrl,
	})

	c.Status(fiber.StatusSeeOther)
	return c.Redirect(url)
}

func LogoutController(c *fiber.Ctx) error {
	deleteCookie(c, webauth.AccessTokenCookieName)
	deleteCookie(c, OriginUrlCookieName)
	return c.SendString("Logout successful")
}

func CallbackController(c *fiber.Ctx) error {
	state := c.Query("state")
	if state != "randomstate" {
		return c.SendString("States don't Match!!")
	}

	code := c.Query("code")
	fmt.Println("Code: " + code)

	kcConfig := webauth.AuthConfig.LoginConfig

	tokenResponse, err := kcConfig.Exchange(c.Context(), code)
	if err != nil {
		return c.SendString("Code-Token Exchange Failed")
	}

	_, err = webauth.VerifyToken(c.Context(), tokenResponse.AccessToken)
	if err != nil {
		return c.SendStatus(401)
	}

	c.Cookie(&fiber.Cookie{
		Name:  webauth.AccessTokenCookieName,
		Value: tokenResponse.AccessToken,
	})
	c.Cookie(&fiber.Cookie{
		Name:  webauth.RefreshTokenCookieName,
		Value: tokenResponse.RefreshToken,
	})

	redirectUrl := c.Cookies(OriginUrlCookieName)
	if redirectUrl == "" {
		redirectUrl = "/"
	}
	deleteCookie(c, OriginUrlCookieName)

	return c.Redirect(redirectUrl)
}

// Ctx.ClearCookie was often not doing the job here; the recommendation
// is to explicitly set the expiration time on the cookie to a time in the past.
// See:
// - https://docs.gofiber.io/api/ctx/#clearcookie (see warning)
// - https://github.com/gofiber/fiber/issues/1127 (solution was to do exactly this)
func deleteCookie(c *fiber.Ctx, name string) {
	c.Cookie(&fiber.Cookie{
		Name:    name,
		Value:   "deleted",
		Expires: time.Now().Add(-(time.Hour * 2)),
	})
}
