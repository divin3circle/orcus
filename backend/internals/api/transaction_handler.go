package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
)

const (
	TOKENDECIMALS = 100
)

type TransactionRequest struct {
	ShopID     string `json:"shop_id"`
	Username   string `json:"username"`
	MerchantID string `json:"merchant_id"`
	Amount     int64  `json:"amount"`
}

type TransactionResponse struct {
	TransactionID     string                    `json:"transaction_id"`
	Transaction       *store.Transaction        `json:"transaction"`
	Fees              hiero.TransactionResponse `json:"fees"`
	HederaTransaction hiero.TransactionResponse `json:"hedera_transaction"`
}

type TransactionHandler struct {
	TransactionStore store.TransactionStore
	UserStore        store.UserStore
	MerchantStore    store.MerchantStore
	Logger           *log.Logger
	Client           *hiero.Client
}

func NewTransactionHandler(transactionStore store.TransactionStore, userStore store.UserStore, merchantStore store.MerchantStore, logger *log.Logger, client *hiero.Client) *TransactionHandler {
	return &TransactionHandler{TransactionStore: transactionStore, UserStore: userStore, Client: client, MerchantStore: merchantStore, Logger: logger}
}

func (th *TransactionHandler) HandleCreateTransaction(w http.ResponseWriter, r *http.Request) {
	operatorAccountID, err := hiero.AccountIDFromString(os.Getenv("OPERATOR_ACCOUNT_ID"))
	if err != nil {
		th.Logger.Printf("Failed to parse operator account ID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	// parse & validate the request body to get the transaction request
	var transactionRequest TransactionRequest
	err = json.NewDecoder(r.Body).Decode(&transactionRequest)
	if err != nil {
		th.Logger.Printf("ERROR: error decoding transaction request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	th.Logger.Printf("Transaction request: %+v", transactionRequest)
	err = th.validateTransactionRequest(&transactionRequest)
	if err != nil {
		th.Logger.Printf("ERROR: error validating transaction request at validateTransactionRequest: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	// get the current user, from db and their encrypted key
	currentUser, err := th.UserStore.GetUserByUsername(transactionRequest.Username)
	if err != nil {
		th.Logger.Printf("ERROR: error getting current user: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
	}
	userKeyString := currentUser.EncryptedKey
	userAccountIDString := currentUser.AccountID
	userAccountID, err := hiero.AccountIDFromString(userAccountIDString)
	if err != nil {
		th.Logger.Printf("ERROR: error getting user account ID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	// TODO: This is where decryption would happen to the key, skipped for simplicity
	userKey, err := hiero.PrivateKeyFromStringEd25519(userKeyString)
	if err != nil {
		th.Logger.Printf("ERROR: error getting user account key: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	merchant, err := th.MerchantStore.GetMerchantByID(transactionRequest.MerchantID)
	if err != nil {
		th.Logger.Printf("ERROR: error getting merchant: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	merchantAccountId, err := hiero.AccountIDFromString(merchant.AccountID)
	if err != nil {
		th.Logger.Printf("ERROR: error getting account ID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	fees := calculateFeesInKsh(transactionRequest.Amount)

	// use decrypted the key and sign the hedera transaction with it to transfer funds to the merchant
	tokenId, err := hiero.TokenIDFromString(os.Getenv("KSH_TOKEN_ID"))
	if err != nil {
		th.Logger.Printf("ERROR: error getting token id: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	// check if the user has enough tokens
	err = th.checkTokenBalance(userAccountID, tokenId, float64(transactionRequest.Amount + parseFeesToInt64(fees)))
	if err != nil {
		th.Logger.Printf("ERROR: error checking token balance: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}


	amount := transactionRequest.Amount * TOKENDECIMALS

	tokenTransferTransaction, err := hiero.NewTransferTransaction().
		AddTokenTransfer(tokenId, userAccountID, -amount).
		AddTokenTransfer(tokenId, merchantAccountId, amount).
		FreezeWith(th.Client)
	if err != nil {
		th.Logger.Printf("ERROR: error freezing transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	transferTransaction := tokenTransferTransaction.Sign(userKey)
	transactionResponse1, err := transferTransaction.Execute(th.Client)
	if err != nil {
		th.Logger.Printf("ERROR: error executing transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	

	tokenFeeTransaction, err := hiero.NewTransferTransaction().
		AddTokenTransfer(tokenId, userAccountID, -parseFeesToInt64(fees)).
		AddTokenTransfer(tokenId, operatorAccountID, parseFeesToInt64(fees)).
		FreezeWith(th.Client)
	if err != nil {
		th.Logger.Printf("ERROR: error freezing transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	feeTransaction := tokenFeeTransaction.Sign(userKey)
	transactionResponse2, err := feeTransaction.Execute(th.Client)
	if err != nil {
		th.Logger.Printf("ERROR: error executing fee transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	// create the transaction in the db
	var transaction = &store.Transaction{}
	transaction.Fee = parseFeesToInt64(fees)
	transaction.Amount = transactionRequest.Amount * TOKENDECIMALS
	transaction.Status = "completed"
	transaction.MerchantID = transactionRequest.MerchantID
	transaction.ShopID = transactionRequest.ShopID
	transaction.UserID = currentUser.ID

	txn, err := th.TransactionStore.CreateTransaction(transaction)
	if err != nil {
		th.Logger.Printf("ERROR: error creating transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	var successfulTxn = &TransactionResponse{
		TransactionID:     txn.ID,
		Transaction:       txn,
		Fees:              transactionResponse2,
		HederaTransaction: transactionResponse1,
	}

	NotifyMerchant(w, merchant.TopicID, "transaction", th.Client)

	utils.WriteJSON(w, http.StatusCreated, utils.Envelope{"data": successfulTxn})
}

func (th *TransactionHandler) HandleGetTransactionByID(w http.ResponseWriter, r *http.Request) {
	paramID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		th.Logger.Printf("ERROR: error reading transaction id at ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	transaction, err := th.TransactionStore.GetTransactionByID(paramID)
	if err != nil {
		th.Logger.Printf("ERROR: error getting transaction by id at GetTransactionByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transaction": transaction})
}

func (th *TransactionHandler) HandleGetTransactionsByShopID(w http.ResponseWriter, r *http.Request) {
	paramID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		th.Logger.Printf("ERROR: error reading transaction id at ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	transactions, err := th.TransactionStore.GetTransactionsByShopID(paramID)
	if err != nil {
		th.Logger.Printf("ERROR: error getting transactions by shop id at GetTransactionsByShopID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transactions": transactions})
}

func (th *TransactionHandler) HandleGetTransactionsByUserID(w http.ResponseWriter, r *http.Request) {
	paramID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		th.Logger.Printf("ERROR: error reading transaction id at ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	transactions, err := th.TransactionStore.GetTransactionsByUserID(paramID)
	if err != nil {
		th.Logger.Printf("ERROR: error getting transactions by user id at GetTransactionsByUserID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transactions": transactions})
}

func (th *TransactionHandler) HandleGetTransactionsByMerchantID(w http.ResponseWriter, r *http.Request) {
	paramID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		th.Logger.Printf("ERROR: error reading transaction id at ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	transactions, err := th.TransactionStore.GetTransactionsByMerchantID(paramID)
	if err != nil {
		th.Logger.Printf("ERROR: error getting transactions by merchant id at GetTransactionsByMerchantID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transactions": transactions})
}

func (th *TransactionHandler) validateTransactionRequest(transactionRequest *TransactionRequest) error {
	if transactionRequest.ShopID == "" {
		return errors.New("shop id is required")
	}
	if transactionRequest.Username == "" {
		return errors.New("user id is required")
	}
	if transactionRequest.MerchantID == "" {
		return errors.New("merchant id is required")
	}
	if transactionRequest.Amount <= 0 {
		return errors.New("amount is required")
	}
	return nil
}

func calculateFeesInKsh(amount int64) float64 {
	if amount <= 100 {
		return float64(0)
	} else {
		return 0.005 * float64(amount)
	}
}

func (th *TransactionHandler) checkTokenBalance(accountID hiero.AccountID, tokenId hiero.TokenID, amount float64) error {
	balanceQuery := hiero.NewAccountBalanceQuery().
	SetAccountID(accountID)

	balanceResponse, err := balanceQuery.Execute(th.Client)
	if err != nil {
		th.Logger.Printf("ERROR: error getting balance: %v", err)
		return err
	}

	accountBalance := float64(balanceResponse.Tokens.Get(tokenId)) / 100

	th.Logger.Printf("Account balance: %f", accountBalance)
	th.Logger.Printf("Amount: %f", amount)

	if accountBalance < amount {
		return errors.New("insufficient balance")
	}

	return nil
}

func parseFeesToInt64(amount float64) int64 {
	return int64(amount * TOKENDECIMALS)
}