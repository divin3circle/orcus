package routes

import (
	"net/http"

	"github.com/divin3circle/orcus/backend/internals/app"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func SetUpRoutes(orcus *app.Application) *chi.Mux {
	r := chi.NewRouter()

	// CORS middleware - allows cross-origin requests
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
			w.Header().Set("Access-Control-Expose-Headers", "Link")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "300")

			// Handle preflight requests
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	// Request logging middleware
	r.Use(middleware.Logger)

	// Recovery middleware
	r.Use(middleware.Recoverer)

	r.Group(func (r chi.Router) {
		r.Use(orcus.Middleware.Authenticate)
		r.Post("/shops", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerCreateShop))
		r.Post("/withdraw", orcus.Middleware.RequireAuthenticatedMerchant(orcus.MerchantHandler.HandleWithdraw))

		r.Get("/shops/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerGetShopByID))
		r.Get("/merchants-id/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.MerchantHandler.HandleGetMerchantByID))
		r.Get("/merchants/{username}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.MerchantHandler.HandleGetMerchantByUsername))
		r.Get("/withdrawals", orcus.Middleware.RequireAuthenticatedMerchant(orcus.MerchantHandler.HandleGetWithdrawals))
		r.Get("/transactions/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.TransactionHandler.HandleGetTransactionByID))
		r.Get("/transactions/shop/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.TransactionHandler.HandleGetTransactionsByShopID))
		r.Get("/transactions/merchant/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.TransactionHandler.HandleGetTransactionsByMerchantID))
		r.Get("/my-campaigns/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerGetShopCampaigns))
		r.Get("/shops/merchant/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerGetShopsByMerchantID))
		r.Get("/shops/campaigns/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerGetShopCampaignsByShopID))
		r.Get("/shops/campaigns/entries/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerGetUserCampaignsEntryByShopID))

		r.Put("/shops/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerUpdateShop))

	})

	r.Group(func (r chi.Router) {
		r.Use(orcus.Middleware.AuthenticateUser)

		r.Get("/users/{username}", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleGetUserByUsername))
		r.Get("/transactions/user/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.TransactionHandler.HandleGetTransactionsByUserID))
		r.Get("/transactions/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.TransactionHandler.HandleGetTransactionByID))
		r.Get("/purchases/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleGetUserPurchases))
		r.Get("/user/campaigns/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleGetUserCampaigns))
		r.Post("/campaigns", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleJoinCampaign))
		r.Get("/user/shops/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.ShopHandler.HandlerGetShopByID))
		r.Get("/user/shops/campaigns/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.ShopHandler.HandlerGetShopCampaignsByShopID))

		r.Post("/campaigns/is-participant", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleIsParticipant))
		r.Post("/campaigns/update", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleUpdateCampaignEntry))
		r.Get("/campaigns/{id}", orcus.Middleware.RequireAuthenticatedUser(orcus.ShopHandler.HandlerGetShopCampaignByCampaignID))
		r.Post("/transactions", orcus.Middleware.RequireAuthenticatedUser(orcus.TransactionHandler.HandleCreateTransaction))
		r.Post("/purchases", orcus.Middleware.RequireAuthenticatedUser(orcus.UserHandler.HandleBuyToken))
	})

	r.Get("/health", orcus.HealthCheck)

	r.Post("/register", orcus.MerchantHandler.HandleCreateMerchant)
	r.Post("/login", orcus.TokenHandler.HandleCreateToken)

	r.Post("/register-user", orcus.UserHandler.HandleCreateUser)
	r.Post("/login-user", orcus.TokenHandler.HandleCreateUserToken)

	return r
}
