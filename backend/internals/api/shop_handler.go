package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/go-chi/chi/v5"
)

type ShopHandler struct{
	ShopStore store.ShopStore
}

func NewShopHandler(shopStore store.ShopStore) *ShopHandler {
	return &ShopHandler{ShopStore: shopStore}
}

func (sh *ShopHandler) HandlerGetShopByID(w http.ResponseWriter, r *http.Request) {
	paramsShopID := chi.URLParam(r, "id")
	if paramsShopID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	shopID, err := strconv.ParseInt(paramsShopID, 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	shop, err := sh.ShopStore.GetShopByID(shopID)
	if err != nil {
		fmt.Printf("Error getting shop by id: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = json.NewEncoder(w).Encode(shop)
	if err != nil {
		fmt.Printf("Error encoding shop: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func (sh *ShopHandler) HandlerCreateShop(w http.ResponseWriter, r *http.Request) {
	var shop store.Shop

	err := json.NewDecoder(r.Body).Decode(&shop)
	if err != nil {
		fmt.Printf("Error decoding shop: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	createdShop, err := sh.ShopStore.CreateShop(&shop)
	if err != nil {
		fmt.Printf("Error creating shop: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(createdShop)
	if err != nil {
		fmt.Printf("Error encoding shop: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (sh *ShopHandler) HandlerUpdateShop(w http.ResponseWriter, r *http.Request) {
	paramsShopID := chi.URLParam(r, "id")
	if paramsShopID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	shopID, err := strconv.ParseInt(paramsShopID, 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	existingShop, err := sh.ShopStore.GetShopByID(shopID)
	if err != nil {
		fmt.Printf("Error getting existing shop by id: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if existingShop == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var updateShopRequest struct {
		Name *string `json:"name"`
		ProfileImageUrl *string `json:"profile_image_url"`
		Campaigns []store.CampaignEntry `json:"campaigns"`
	}

	err = json.NewDecoder(r.Body).Decode(&updateShopRequest)
	if err != nil {
		fmt.Printf("Error decoding update shop request: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		w.WriteHeader(http.StatusBadRequest)
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
		fmt.Printf("Error updating shop: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(existingShop)
	if err != nil {
		fmt.Printf("Error encoding shop: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}