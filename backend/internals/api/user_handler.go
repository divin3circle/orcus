package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
	"github.com/go-chi/chi/v5"
)

type UserRegisterRequest struct {
	Username        string `json:"username"`
	MobileNumber    string `json:"mobile_number"`
	Password        string `json:"password"`
	ProfileImageUrl string `json:"profile_image_url"`
}

type UserBuyTokenRequest struct {
	Amount int64 `json:"amount"`
	UserID string `json:"user_id"`
}

type UserHandler struct {
	UserStore store.UserStore
	Logger    *log.Logger
	Client    *hiero.Client
}

func NewUserHandler(userStore store.UserStore, logger *log.Logger, client *hiero.Client) *UserHandler {
	return &UserHandler{UserStore: userStore, Logger: logger, Client: client}
}

func (uh *UserHandler) HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	tokenId, err := hiero.TokenIDFromString(os.Getenv("KSH_TOKEN_ID"))
	if err != nil {
		uh.Logger.Printf("ERROR: error getting token id: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	var req UserRegisterRequest

	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error decoding user register request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	err = uh.validateRegisterRequest(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error validating user register request at validateRegisterRequest: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	newPrivateKey, _ := hiero.PrivateKeyGenerateEd25519()
	newPublicKey := newPrivateKey.PublicKey()
	createAccountTxn, err := hiero.NewAccountCreateTransaction().
		SetKeyWithoutAlias(newPublicKey).
		SetMaxAutomaticTokenAssociations(10).
		SetInitialBalance(hiero.NewHbar(5)).
		FreezeWith(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error creating account transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	txResponse, err := createAccountTxn.Execute(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting trasaction response for account transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	receipt, err := txResponse.GetReceipt(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting receipt response for account transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	userAccountID := *receipt.AccountID

	user := &store.User{
		Username:        req.Username,
		MobileNumber:    req.MobileNumber,
		EncryptedKey:    newPrivateKey.String(),
		AccountID:       userAccountID.String(),
		ProfileImageUrl: req.ProfileImageUrl,
	}
	err = user.PasswordHash.Set(req.Password)
	if err != nil {
		uh.Logger.Printf("ERROR: error hashing password at Set: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	createdUser, err := uh.UserStore.CreateUser(user)
	if err != nil {
		uh.Logger.Printf("ERROR: error creating user at CreateUser: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	associateTokenTxn, err := hiero.NewTokenAssociateTransaction().
		SetAccountID(userAccountID).
		SetTokenIDs(tokenId).
		FreezeWith(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error creating token associate transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	transactionResponse, err := associateTokenTxn.Sign(newPrivateKey).Execute(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error executing token associate transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	receipt, err = transactionResponse.GetReceipt(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting receipt response for token associate transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	uh.Logger.Printf("KSH token associated successfully with user account: %v", receipt.AccountID)

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"user": createdUser})
}

func (uh *UserHandler) HandleGetUserByUsername(w http.ResponseWriter, r *http.Request) {
	userUsername := chi.URLParam(r, "username")
	if userUsername == "" {
		uh.Logger.Printf("ERROR: error reading user username in chi.URLParam: %v", userUsername)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": userUsername})
		return
	}

	user, err := uh.UserStore.GetUserByUsername(userUsername)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user by username in GetUserByUsername: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"user": user})
}

func (uh *UserHandler) HandleBuyToken(w http.ResponseWriter, r *http.Request) {
	var req UserBuyTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error decoding user buy token request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	// TODO: Add payment validation from Daraja or Stripe API
	// TODO: Transfer KSH token from operator account to user account

	err = uh.UserStore.BuyToken(req.UserID, req.Amount)
	if err != nil {
		uh.Logger.Printf("ERROR: error buying token in BuyToken: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	message := fmt.Sprintf("KSH token bought successfully for %d KSH", req.Amount)
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": message})
}

func (uh *UserHandler) HandleGetUserPurchases(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		uh.Logger.Printf("ERROR: error reading user id in ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	purchases, err := uh.UserStore.GetUserPurchases(userID)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user purchases in GetUserPurchases: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"purchases": purchases})
}

func (uh *UserHandler) validateRegisterRequest(registerRequest *UserRegisterRequest) error {
	if registerRequest.Username == "" {
		return errors.New("username is required")
	}
	if registerRequest.MobileNumber == "" {
		return errors.New("mobile number is required")
	}
	if registerRequest.Password == "" {
		return errors.New("password is required")
	}
	if registerRequest.ProfileImageUrl == "" {
		return errors.New("profile image url is required")
	}
	if len(registerRequest.MobileNumber) != 13 {
		return errors.New("mobile number must be 13 digits")
	}
	if len(registerRequest.Password) < 6 {
		return errors.New("password must be at least 6 characters long")
	}
	if len(registerRequest.Username) < 3 || len(registerRequest.Username) > 50 {
		return errors.New("username must be between 3 and 50 characters long")
	}
	return nil
}
