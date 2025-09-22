package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/divin3circle/orcus/backend/internals/middleware"
	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
	"github.com/go-chi/chi/v5"
)

type RegisterRequest struct {
	Username string `json:"username"`
	MobileNumber string `json:"mobile_number"`
	Password string `json:"password"`
	AccountID string `json:"account_id"`
	ProfileImageUrl string `json:"profile_image_url"`
	AccountBannerImageUrl string `json:"account_banner_image_url"`
	AutoOfframp bool `json:"auto_offramp"`
}

type WithdrawRequest struct {
	Amount int64 `json:"amount"`
	Receiver string `json:"receiver"`
}

type MerchantHandler struct{
	MerchantStore store.MerchantStore
	Logger *log.Logger 
}

func NewMerchantHandler(merchantStore store.MerchantStore, logger *log.Logger) *MerchantHandler {
	return &MerchantHandler{
		MerchantStore: merchantStore,
		Logger: logger,
	}
}

func (mh *MerchantHandler) HandleGetMerchantByUsername(w http.ResponseWriter, r *http.Request) {
	merchantUsername := chi.URLParam(r, "username")
	if merchantUsername == "" {
		mh.Logger.Printf("ERROR: error reading merchant username in chi.URLParam, %v", merchantUsername)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": merchantUsername})
		return
	}

	merchant, err := mh.MerchantStore.GetMerchantByUsername(merchantUsername)
	if err != nil {
		mh.Logger.Printf("ERROR: error getting merchant by username in GetMerchantByUsername, %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"merchant": merchant})
}

func (mh *MerchantHandler) HandleCreateMerchant(w http.ResponseWriter, r *http.Request){
	var req RegisterRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		mh.Logger.Printf("ERROR: error while decoding merchant request body at Decode, %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	err = mh.validateRegisterRequest(&req)
	if err != nil {
		mh.Logger.Printf("ERROR: error while validating merchant request at validateRegisterRequest, %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	merchant := &store.Merchant{
		Username: req.Username,
		MobileNumber: req.MobileNumber,
		AccountID: req.AccountID,
		ProfileImageUrl: req.ProfileImageUrl,
		AccountBannerImageUrl: req.AccountBannerImageUrl,
	}
	err = merchant.PasswordHash.Set(req.Password)
	if err != nil {
		mh.Logger.Printf("ERROR: error while hashing password at Set, %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	createdMerchant, err := mh.MerchantStore.CreateMerchant(merchant)
	if err != nil {
		mh.Logger.Printf("ERROR: error creating merchant at CreateMerchant: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"merchant": createdMerchant})
}

func (mh *MerchantHandler) validateRegisterRequest(registerRequest *RegisterRequest) error {
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
	if registerRequest.AccountBannerImageUrl == "" {
		return errors.New("account banner image url is required")
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

func (mh *MerchantHandler) HandleWithdraw(w http.ResponseWriter, r *http.Request) {
	var req WithdrawRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		mh.Logger.Printf("ERROR: error while decoding withdraw request body at Decode, %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	merchant := middleware.GetMerchant(r)
	withdrawal, err := mh.MerchantStore.Withdraw(merchant, req.Amount, req.Receiver)
	if err != nil {
		mh.Logger.Printf("ERROR: error while withdrawing at Withdraw, %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"withdrawal": withdrawal})
}

func (mh *MerchantHandler) HandleGetWithdrawals(w http.ResponseWriter, r *http.Request) {
	merchant := middleware.GetMerchant(r)
	withdrawals, err := mh.MerchantStore.GetWithdrawals(merchant)
	if err != nil {
		mh.Logger.Printf("ERROR: error while getting withdrawals at GetWithdrawals, %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"withdrawals": withdrawals})
}