package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/tokens"
	"github.com/divin3circle/orcus/backend/internals/utils"
)

type CreateTokenRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TokenHandler struct {
	TokenStore store.TokenStore
	MerchantStore store.MerchantStore
	Logger *log.Logger
}

func NewTokenHandler(tokenStore store.TokenStore, merchantStore store.MerchantStore, logger *log.Logger) *TokenHandler {
	return &TokenHandler{TokenStore: tokenStore, MerchantStore: merchantStore, Logger: logger}
}

func (th *TokenHandler) HandleCreateToken(w http.ResponseWriter, r *http.Request) {
	var req CreateTokenRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		th.Logger.Printf("ERROR: error decoding create token request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	merchant, err := th.MerchantStore.GetMerchantByUsername(req.Username)
	if err != nil || merchant == nil {
		th.Logger.Printf("ERROR: error getting merchant by username in GetMerchantByUsername: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	ok, err := merchant.PasswordHash.Matches(req.Password)
	if err != nil {
		th.Logger.Printf("ERROR: error matching password at Matches: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	if !ok {
		th.Logger.Printf("ERROR: error matching password at Matches: %v", err)
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid password"})
		return
	}

	token, err := th.TokenStore.Create(merchant.ID, 24*time.Hour, tokens.ScopeAuthentication)
	if err != nil {
		th.Logger.Printf("ERROR: error creating token at Create: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"token": token})
}

