package routes

import (
	"github.com/divin3circle/orcus/backend/internals/app"
	"github.com/go-chi/chi/v5"
)

func SetUpRoutes(orcus *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", orcus.HealthCheck)
	r.Get("/merchants/{username}", orcus.MerchantHandler.HandleGetMerchantByUsername)
	r.Get("/shops/{id}", orcus.ShopHandler.HandlerGetShopByID)

	r.Post("/shops", orcus.ShopHandler.HandlerCreateShop)
	r.Post("/register", orcus.MerchantHandler.HandleCreateMerchant)

	r.Put("/shops/{id}", orcus.ShopHandler.HandlerUpdateShop)
	return r
}
