package api

import (
	"fmt"
	"github.com/go-chi/chi/v5"
	"net/http"
	"strconv"
)

type MerchantHandler struct{}

func NewMerchantHandler() *MerchantHandler {
	return &MerchantHandler{}
}

func (mh *MerchantHandler) GetMerchantById(w http.ResponseWriter, r *http.Request) {
	paramsMerchantId := chi.URLParam(r, "id")

	if paramsMerchantId == "" {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("MerchantId is required"))
		return
	}

	merchantId, err := strconv.Atoi(paramsMerchantId)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	fmt.Fprintf(w, "MerchantId: %v", merchantId)

}
