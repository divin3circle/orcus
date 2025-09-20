package routes

import (
	"github.com/divin3circle/orcus/backend/internals/app"
	"github.com/go-chi/chi/v5"
)

func SetUpRoutes(orcus *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Group(func (r chi.Router) {
		r.Use(orcus.Middleware.Authenticate)
		r.Post("/shops", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerCreateShop))

		r.Get("/shops/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerGetShopByID))
		r.Get("/merchants/{username}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.MerchantHandler.HandleGetMerchantByUsername))

		r.Put("/shops/{id}", orcus.Middleware.RequireAuthenticatedMerchant(orcus.ShopHandler.HandlerUpdateShop))
	})

	r.Get("/health", orcus.HealthCheck)

	r.Post("/register", orcus.MerchantHandler.HandleCreateMerchant)
	r.Post("/login", orcus.TokenHandler.HandleCreateToken)

	return r
}
