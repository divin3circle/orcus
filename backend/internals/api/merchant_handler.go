package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/divin3circle/orcus/backend/internals/middleware"
	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
	"github.com/go-chi/chi/v5"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
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

type NotificationMessage struct {
	Type string `json:"type"`
	MessageContent string `json:"message_content"`
	Timestamp int64 `json:"timestamp"`
}

type MerchantHandler struct{
	MerchantStore store.MerchantStore
	Logger *log.Logger 
	Client *hiero.Client
}

func NewMerchantHandler(merchantStore store.MerchantStore, logger *log.Logger, client *hiero.Client) *MerchantHandler {
	return &MerchantHandler{
		MerchantStore: merchantStore,
		Logger: logger,
		Client: client,
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
	merchant.TopicID = mh.generateTopicID(w, merchant)

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

	NotifyMerchant(w, merchant.TopicID, "withdrawal", mh.Client)
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

func (mh *MerchantHandler) HandleGetMerchantByID(w http.ResponseWriter, r *http.Request) {
	merchantID := chi.URLParam(r, "id")
	if merchantID == "" {
		mh.Logger.Printf("ERROR: error reading merchant id in chi.URLParam, %v", merchantID)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": merchantID})
		return
	}

	merchant, err := mh.MerchantStore.GetMerchantByID(merchantID)
	if err != nil {
		mh.Logger.Printf("ERROR: error getting merchant by id at GetMerchantByID, %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"merchant": merchant})
}

func (mh *MerchantHandler) generateTopicID(w http.ResponseWriter, merchant *store.Merchant) string {
	transaction := hiero.NewTopicCreateTransaction().
	SetTopicMemo(merchant.Username)
	txResponse, err := transaction.Execute(mh.Client)
	if err != nil {
		mh.Logger.Printf("ERROR: error executing topic create transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		panic(err)
	}
	receipt, err := txResponse.GetReceipt(mh.Client)
	if err != nil {
		mh.Logger.Printf("ERROR: error getting receipt response for topic create transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		panic(err)
	}

	topicID := *receipt.TopicID

	fmt.Println("\nNotification topic created:", topicID.String())
	return topicID.String()
}

func NotifyMerchant(w http.ResponseWriter, topicID string, messageType string, client *hiero.Client) {
	var messageContent string
	switch messageType {
	case "transaction":
		messageContent = "Payment received"
	case "airdrop":
		messageContent = "KSH Token airdropped successfully"
	case "withdrawal":
		messageContent = "Withdrawal completed"
	case "shop_created":
		messageContent = "Shop created"
	case "campaign_created":
		messageContent = "Campaign created"
	case "joined_campaign":
		messageContent = "A user joined your campaign"
	default:
		messageContent = "Unknown message type"
	}

	topicIDObj, err := hiero.TopicIDFromString(topicID)
	if err != nil {
		fmt.Printf("ERROR: error getting topic id: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	topicMessage := NotificationMessage{
		Type: messageType,
		MessageContent: messageContent,
		Timestamp: time.Now().Unix(),
	}

	marshalledMessage, err := json.Marshal(topicMessage)
	if err != nil {
		fmt.Printf("ERROR: error marshalling message: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	submitMessage, err := hiero.NewTopicMessageSubmitTransaction().
		SetMessage(marshalledMessage).
		SetTopicID(topicIDObj).
		Execute(client)
	if err != nil {
		fmt.Printf("ERROR: error freezing transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	receipt, err := submitMessage.GetReceipt(client)
	if err != nil {
		fmt.Printf("ERROR: error getting receipt response for topic message submit transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	fmt.Printf("Topic message submitted successfully: %v", receipt.TopicID)
}