package auth

import (
	"context"

	"github.com/mrshanahan/notes-api/pkg/auth"
)

var (
	AuthConfig *auth.Config
)

// type Config struct {
// 	KeycloakBaseUri     string
// 	KeycloakLoginConfig oauth2.Config
// }

// func buildAuthConfig(context context.Context, urlRoot string) *auth.Config {
// 	baseProviderUrl := "http://localhost:8080/realms/notes"
// 	provider, err := oidc.NewProvider(context, baseProviderUrl)
// 	if err != nil {
// 		panic("Could not load OIDC configuration: " + err.Error())
// 	}

// 	config := &Config{
// 		KeycloakLoginConfig: oauth2.Config{
// 			ClientID:    "notes-web",
// 			RedirectURL: fmt.Sprintf("%s/auth/callback", urlRoot),
// 			Endpoint:    provider.Endpoint(),
// 			Scopes:      []string{"profile", "email", oidc.ScopeOpenID},
// 		},
// 		KeycloakBaseUri: baseProviderUrl,
// 		// KeycloakIDTokenVerifier: provider.Verifier(&oidc.Config{ClientID: AuthConfig.KeycloakLoginConfig.ClientID}),
// 	}
// 	return config

// }

func InitializeAuth(ctx context.Context, baseProviderUrl string, redirectUrl string) {
	// AuthConfig = buildAuthConfig(context.Background(), urlRoot)
	AuthConfig = auth.BuildAuthConfig(ctx, "notes-web", baseProviderUrl, redirectUrl)
}
