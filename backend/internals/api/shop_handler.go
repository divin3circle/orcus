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

	_, _ = fmt.Fprintf(w, "Shop ID: %d", shopID)
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
