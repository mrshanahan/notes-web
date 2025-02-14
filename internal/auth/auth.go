package auth

import (
	"context"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

var (
	AuthConfig *Config
)

type Config struct {
	KeycloakBaseUri     string
	KeycloakLoginConfig oauth2.Config
}

func buildAuthConfig(context context.Context, urlRoot string) *Config {
	baseProviderUrl := "http://localhost:8080/realms/notes"
	provider, err := oidc.NewProvider(context, baseProviderUrl)
	if err != nil {
		panic("Could not load OIDC configuration: " + err.Error())
	}

	config := &Config{
		KeycloakLoginConfig: oauth2.Config{
			ClientID:    "notes-web",
			RedirectURL: fmt.Sprintf("%s/auth/callback", urlRoot),
			Endpoint:    provider.Endpoint(),
			Scopes:      []string{"profile", "email", oidc.ScopeOpenID},
		},
		KeycloakBaseUri: baseProviderUrl,
		// KeycloakIDTokenVerifier: provider.Verifier(&oidc.Config{ClientID: AuthConfig.KeycloakLoginConfig.ClientID}),
	}
	return config

}

func InitializeAuth(urlRoot string) {
	AuthConfig = buildAuthConfig(context.Background(), urlRoot)
}
