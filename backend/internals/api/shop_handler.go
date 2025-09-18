package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
)

type ShopHandler struct{
	ShopStore store.ShopStore
	Logger *log.Logger
}

func NewShopHandler(shopStore store.ShopStore, logger *log.Logger) *ShopHandler {
	return &ShopHandler{ShopStore: shopStore, Logger: logger}
}

func (sh *ShopHandler) HandlerGetShopByID(w http.ResponseWriter, r *http.Request) {
	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	shop, err := sh.ShopStore.GetShopByID(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id GetShopByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"shop": shop})
}

func (sh *ShopHandler) HandlerCreateShop(w http.ResponseWriter, r *http.Request) {
	var shop store.Shop

	err := json.NewDecoder(r.Body).Decode(&shop)
	if err != nil {
		sh.Logger.Printf("ERROR: error decoding shop Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	createdShop, err := sh.ShopStore.CreateShop(&shop)
	if err != nil {
		sh.Logger.Printf("ERROR: error creating shop CreateShop: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"shop": createdShop})
}

func (sh *ShopHandler) HandlerUpdateShop(w http.ResponseWriter, r *http.Request) {
	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	existingShop, err := sh.ShopStore.GetShopByID(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting existing shop by id GetShopByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	if existingShop == nil {
		sh.Logger.Printf("ERROR: error getting existing shop by id GetShopByID, existing shop is nil: %v", err)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "shop not found"})
		return
	}

	var updateShopRequest struct {
		Name *string `json:"name"`
		ProfileImageUrl *string `json:"profile_image_url"`
		Campaigns []store.CampaignEntry `json:"campaigns"`
	}

	err = json.NewDecoder(r.Body).Decode(&updateShopRequest)
	if err != nil {
		sh.Logger.Printf("ERROR: error decoding update shop request Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	
	if updateShopRequest.Name != nil {
		existingShop.Name = *updateShopRequest.Name
	}

	if updateShopRequest.ProfileImageUrl != nil {
		existingShop.ProfileImageUrl = *updateShopRequest.ProfileImageUrl
	}

	if updateShopRequest.Campaigns != nil {
		existingShop.Campaigns = updateShopRequest.Campaigns
	}

	err = sh.ShopStore.UpdateShop(existingShop)
	if err != nil {
		sh.Logger.Printf("ERROR: error updating shop UpdateShop: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	_ = utils.WriteJSON(w, http.StatusOK, utils.Envelope{"shop": existingShop})
}
