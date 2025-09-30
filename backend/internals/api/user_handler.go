package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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

type UserCampaignRequest struct {
	CampaignID string `json:"campaign_id"`
	UserID string `json:"user_id"`
	Username string `json:"username"`
	TokenBalance int64 `json:"token_balance"`
}

type UserHandler struct {
	UserStore store.UserStore
	ShopStore store.ShopStore
	Logger    *log.Logger
	Client    *hiero.Client
}

func NewUserHandler(userStore store.UserStore, shopStore store.ShopStore, logger *log.Logger, client *hiero.Client) *UserHandler {
	return &UserHandler{UserStore: userStore, ShopStore: shopStore, Logger: logger, Client: client}
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
	user.TopicID = uh.generateTopicID(w, user)

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
	NotifyUser(w, user.TopicID, "account", uh.Client)
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

	user, err := uh.UserStore.GetUserByID(req.UserID)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user by id in GetUserByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	transactionID, err := uh.transferTokenToUser(user.AccountID, req.Amount * TOKENDECIMALS, os.Getenv("KSH_TOKEN_ID"))
	if err != nil {
		uh.Logger.Printf("ERROR: error transferring token to user in transferTokenToUser: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	err = uh.UserStore.BuyToken(req.UserID, req.Amount)
	if err != nil {
		uh.Logger.Printf("ERROR: error buying token in BuyToken: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	NotifyUser(w, user.TopicID, "buy", uh.Client)
	message := fmt.Sprintf("KSH token bought successfully for %d KSH", req.Amount)
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": message, "transaction_id": transactionID})
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

func (uh *UserHandler) HandleGetUserCampaigns(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		uh.Logger.Printf("ERROR: error reading user id in ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	campaigns, err := uh.UserStore.GetUserCampaigns(userID)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user campaigns in GetUserCampaigns: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"campaigns": campaigns})
}

func (uh *UserHandler) HandleJoinCampaign(w http.ResponseWriter, r *http.Request) {
	var req UserCampaignRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error decoding user join campaign request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	campaign, err := uh.ShopStore.GetShopCampaignByCampaignID(req.CampaignID)
	if campaign == nil {
		uh.Logger.Printf("ERROR: error getting campaign by id in GetCampaignByID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Campaign not found"})
		return
	}
	if err != nil {
		uh.Logger.Printf("ERROR: error getting campaign by id in GetCampaignByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	user, err := uh.UserStore.GetUserByID(req.UserID)
	if user == nil {
		uh.Logger.Printf("ERROR: error getting user by id in GetUserByID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "User not found"})
		return
	}
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user by id in GetUserByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	err = uh.UserStore.JoinCampaign(user.ID, req.CampaignID, req.TokenBalance)
	if err != nil {
		uh.Logger.Printf("ERROR: error joining campaign in JoinCampaign: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	NotifyMerchant(w, req.CampaignID, "joined_campaign", uh.Client)
	transactionID, err := uh.transferTokenToUser(user.AccountID, req.TokenBalance * TOKENDECIMALS, campaign.TokenID)
	if err != nil {
		uh.Logger.Printf("ERROR: error transferring token to user in transferTokenToUser: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	NotifyUser(w, user.TopicID, "join", uh.Client)

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "Campaign joined successfully", "transaction_id": transactionID})
}

func (uh *UserHandler) HandleIsParticipant(w http.ResponseWriter, r *http.Request) {
	var req UserCampaignRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error decoding user is participant request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	isParticipant, err := uh.UserStore.IsParticipant(req.UserID, req.CampaignID)
	if err != nil {
		uh.Logger.Printf("ERROR: error checking if user is participant in IsParticipant: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"is_participant": isParticipant})
}

func (uh *UserHandler) HandleUpdateCampaignEntry(w http.ResponseWriter, r *http.Request) {
	var req UserCampaignRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error decoding user update campaign entry request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	campaign, err := uh.ShopStore.GetShopCampaignByCampaignID(req.CampaignID)
	if campaign == nil {
		uh.Logger.Printf("ERROR: error getting campaign by id in GetCampaignByID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Campaign not found"})
		return
	}
	if err != nil {
		uh.Logger.Printf("ERROR: error getting campaign by id in GetCampaignByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	user, err := uh.UserStore.GetUserByUsername(req.Username)
	if user == nil {
		uh.Logger.Printf("ERROR: error getting user by id in GetUserByID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "User not found"})
		return
	}
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user by id in GetUserByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	err = uh.UserStore.UpdateCampaignEntry(user.ID, req.CampaignID, req.TokenBalance)
	if err != nil {
		uh.Logger.Printf("ERROR: error updating campaign entry in UpdateCampaignEntry: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	transactionID, err := uh.transferTokenToUser(user.AccountID, req.TokenBalance * TOKENDECIMALS, campaign.TokenID)
	if err != nil {
		uh.Logger.Printf("ERROR: error transferring token to user in transferTokenToUser: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	NotifyUser(w, user.TopicID, "update", uh.Client)
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "Campaign entry updated successfully", "transaction_id": transactionID})
}

func (uh *UserHandler) HandleGetUserByID(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		uh.Logger.Printf("ERROR: error reading user id in ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	user, err := uh.UserStore.GetUserByID(userID)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user by id in GetUserByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"user": user})
}

func (uh *UserHandler) generateTopicID(w http.ResponseWriter, user *store.User) string {
	transaction := hiero.NewTopicCreateTransaction().
	SetTopicMemo(user.Username)
	txResponse, err := transaction.Execute(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error executing topic create transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		panic(err)
	}
	receipt, err := txResponse.GetReceipt(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting receipt response for topic create transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		panic(err)
	}

	topicID := *receipt.TopicID

	fmt.Println("\nNotification topic created:", topicID.String())
	return topicID.String()
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

func (uh *UserHandler) transferTokenToUser(accountID string, amount int64, tokenId string) (string, error) {
	uh.Logger.Printf("Transferring token to user account: %v", accountID)
	uh.Logger.Printf("Amount: %v", amount)
	uh.Logger.Printf("Token ID: %v", tokenId)
	uh.Logger.Printf("Operator Account ID: %v", os.Getenv("OPERATOR_ACCOUNT_ID"))
	uh.Logger.Printf("Operator Key: %v", os.Getenv("OPERATOR_KEY"))
	userAccountID, err := hiero.AccountIDFromString(accountID)
	if err != nil {
		return "", err
	}
	tokenID, err := hiero.TokenIDFromString(tokenId)
	if err != nil {
		return "", err
	}
	operatorAccountID, err := hiero.AccountIDFromString(os.Getenv("OPERATOR_ACCOUNT_ID"))
	if err != nil {
		return "", err
	}
	operatorKey, err := hiero.PrivateKeyFromStringEd25519(os.Getenv("OPERATOR_KEY"))
	if err != nil {
		return "", err
	}

	tokenTransferTransaction, err := hiero.NewTransferTransaction().
		AddTokenTransfer(tokenID, operatorAccountID, -amount).
		AddTokenTransfer(tokenID, userAccountID, amount).
		FreezeWith(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error freezing transaction: %v", err)
		return "", err
	}
	transferTransaction := tokenTransferTransaction.Sign(operatorKey)
	txnResponse, err := transferTransaction.Execute(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error executing transaction: %v", err)
		return "", err
	}
	receipt, err := txnResponse.GetReceipt(uh.Client)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting receipt response for token transfer transaction: %v", err)
		return "", err
	}
	uh.Logger.Printf("KSH token transferred successfully to user account: %v", receipt.AccountID)
	return receipt.TransactionID.String(), nil
}

func NotifyUser(w http.ResponseWriter, topicID string, messageType string, client *hiero.Client) {
	var messageContent string

	switch messageType {
	case "transaction":
		messageContent = "Payment sent successfully"
	case "buy":
		messageContent = "KSH Token bought successfully"
	case "send":
		messageContent = "KSH Token sent successfully"
	case "join":
		messageContent = "Campaign joined successfully"
	case "update":
		messageContent = "Campaign entry updated successfully"
	default:
		messageContent = "Account created successfully"
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
