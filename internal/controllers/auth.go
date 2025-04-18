package controllers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	webauth "github.com/mrshanahan/notes-web/internal/auth"
)

// TODO: Is this how we even want to construct this?

var (
	OriginUrlCookieName = "origin_url"
)

func LoginController(c *fiber.Ctx) error {
	url := webauth.AuthConfig.LoginConfig.AuthCodeURL("randomstate")

	originUrl := c.Query(OriginUrlCookieName)
	if originUrl == "" {
		originUrl = "/" // TODO: Constant/pass this in/truncate URL path
	}
	c.Cookie(&fiber.Cookie{
		Name:  OriginUrlCookieName,
		Value: originUrl,
	})

	c.Status(fiber.StatusSeeOther)
	c.Redirect(url)
	return c.JSON(url) // TODO: Do we need this?
}

func LogoutController(c *fiber.Ctx) error {
	deleteCookie(c, webauth.TokenCookieName)
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
		Name:  webauth.TokenCookieName,
		Value: tokenResponse.AccessToken,
	})

	redirectUrl := c.Cookies(OriginUrlCookieName)
	if redirectUrl != "" {
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
