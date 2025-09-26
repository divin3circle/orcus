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
	UserTokenStore store.UserTokenStore
	MerchantStore store.MerchantStore
	UserStore store.UserStore
	Logger *log.Logger
}

func NewTokenHandler(tokenStore store.TokenStore, merchantStore store.MerchantStore, userStore store.UserStore, userTokenStore store.UserTokenStore, logger *log.Logger) *TokenHandler {
	return &TokenHandler{TokenStore: tokenStore, UserTokenStore: userTokenStore, MerchantStore: merchantStore, UserStore: userStore, Logger: logger}
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
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid username or password"})
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

func (th *TokenHandler) HandleCreateUserToken(w http.ResponseWriter, r *http.Request) {
	var req CreateTokenRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		th.Logger.Printf("ERROR: error decoding create token request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	user, err := th.UserStore.GetUserByUsername(req.Username)
	if err != nil || user == nil {
		th.Logger.Printf("ERROR: error getting merchant by username in GetMerchantByUsername: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	ok, err := user.PasswordHash.Matches(req.Password)
	if err != nil {
		th.Logger.Printf("ERROR: error matching password at Matches: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	if !ok {
		th.Logger.Printf("ERROR: error matching password at Matches: %v", err)
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid username or password"})
		return
	}

	token, err := th.UserTokenStore.Create(user.ID, 24*time.Hour, tokens.ScopeAuthentication)
	if err != nil {
		th.Logger.Printf("ERROR: error creating token at Create: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"token": token, "user_id": user.ID})
}

