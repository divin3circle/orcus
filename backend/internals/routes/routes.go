package routes

import (
	"github.com/divin3circle/orcus/backend/internals/app"
	"github.com/go-chi/chi/v5"
)

func SetUpRoutes(orcus *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", orcus.HealthCheck)
	r.Get("/merchants/{id}", orcus.MerchantHandler.GetMerchantById)
	
	return r
}
