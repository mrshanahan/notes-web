package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	webauth "github.com/mrshanahan/notes-web/internal/auth"
	"github.com/mrshanahan/notes-web/internal/controllers"

	"github.com/gofiber/template/html/v2"
)

var (
	DefaultStaticFilesDir string = "./assets"
	DefaultPort           int    = 4444
)

func main() {
	exitCode := Run()
	os.Exit(exitCode)
}

func Run() int {
	staticFilesDir := os.Getenv("NOTES_WEB_STATIC_FILES_DIR")
	if staticFilesDir == "" {
		staticFilesDir = DefaultStaticFilesDir
	}

	if _, err := os.Stat(staticFilesDir); err != nil {
		if os.IsNotExist(err) {
			slog.Error("could not find static files directory",
				"path", staticFilesDir)
		} else {
			slog.Error("unknown error when attempting to find static files directory",
				"path", staticFilesDir,
				"err", err)
		}

		return 1
	}

	notesApiUrl := os.Getenv("NOTES_WEB_API_URL")
	if notesApiUrl == "" {
		panic("Required value for NOTES_WEB_API_URL but none provided")
	}

	portStr := os.Getenv("NOTES_WEB_PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = DefaultPort
		slog.Info("no valid port provided via NOTES_WEB_PORT, using default",
			"portStr", portStr,
			"defaultPort", port)
	} else {
		slog.Info("using custom port",
			"port", port)
	}

	// TODO: Extract this
	disableAuth := false
	disableAuthOption := strings.TrimSpace(os.Getenv("NOTES_WEB_DISABLE_AUTH"))
	if disableAuthOption != "" {
		slog.Warn("disabling authentication framework - THIS SHOULD ONLY BE RUN FOR TESTING!")
		disableAuth = true
	}

	if !disableAuth {
		authProviderUrl := os.Getenv("NOTES_WEB_AUTH_PROVIDER_URL")
		if authProviderUrl == "" {
			panic("Required value for NOTES_WEB_AUTH_PROVIDER_URL but none provided")
		}
		redirectUrl := os.Getenv("NOTES_WEB_REDIRECT_URL")
		if redirectUrl == "" {
			panic("Required value for NOTES_WEB_REDIRECT_URL but none provided")
		}
		webauth.InitializeAuth(context.Background(), authProviderUrl, redirectUrl)
	} else {
		slog.Warn("skipping initialization of authentication framework", "disableAuth", disableAuth)
	}

	jsEngine := html.New(staticFilesDir, ".js")
	app := fiber.New(fiber.Config{
		Views: jsEngine,
	})
	app.Use(requestid.New(), logger.New(), recover.New())
	app.Route("/", func(notes fiber.Router) {
		// TODO: Do we actually need this if we're only serving static files?
		// notes.Use(middleware.ValidateAccessToken(webauth.TokenLocalName, webauth.TokenCookieName))
		notes.Route("/auth", func(authR fiber.Router) {
			authR.Get("/login", controllers.LoginController)
			authR.Get("/logout", controllers.LogoutController)
			authR.Get("/callback", controllers.CallbackController)
		})
		notes.Get("/*.js", func(c *fiber.Ctx) error {
			return c.Render(c.Params("*"), fiber.Map{
				"ApiUrl": notesApiUrl,
			})
		})
		notes.Use(filesystem.New(filesystem.Config{
			// This should encompass: /, /login, /edit
			Root:   http.Dir(staticFilesDir),
			Browse: false,
			Index:  "index.html",
			// TODO: 404 page?
		}))
	})

	slog.Info("listening for requests", "port", port)
	err = app.Listen(fmt.Sprintf(":%d", port))
	if err != nil {
		// TODO: do we get this error if it fails to initialize or if it just fails?
		slog.Error("failed to initialize HTTP server",
			"err", err)
		return 1
	}
	return 0
}
