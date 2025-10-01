package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/divin3circle/orcus/backend/internals/middleware"
	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type ShopHandler struct{
	ShopStore store.ShopStore
	UserStore store.UserStore
	Logger *log.Logger
	Client *hiero.Client
}

func NewShopHandler(shopStore store.ShopStore, userStore store.UserStore, logger *log.Logger, client *hiero.Client) *ShopHandler {
	return &ShopHandler{ShopStore: shopStore, UserStore: userStore, Logger: logger, Client: client}
}

func (sh *ShopHandler) HandlerGetShopByID(w http.ResponseWriter, r *http.Request) {
	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	shop, err := sh.ShopStore.GetShopByID(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id GetShopByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"shop": shop})
}

func (sh *ShopHandler) HandlerCreateShop(w http.ResponseWriter, r *http.Request) {
	var shop store.Shop

	err := json.NewDecoder(r.Body).Decode(&shop)
	if err != nil {
		sh.Logger.Printf("ERROR: error decoding shop Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	cm := middleware.GetMerchant(r)
	if cm == nil || cm.IsAnonymous() {
		sh.Logger.Printf("ERROR: error getting current merchant in GetMerchant, current merchant is nil or anonymous")
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "unauthorized"})
		return
	}

	shop.MerchantID = cm.ID


	createdShop, err := sh.ShopStore.CreateShop(&shop)
	if err != nil {
		sh.Logger.Printf("ERROR: error creating shop CreateShop: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	NotifyMerchant(w, cm.TopicID, "shop_created", sh.Client)

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"shop": createdShop})
}

func (sh *ShopHandler) HandlerUpdateShop(w http.ResponseWriter, r *http.Request) {
	operatorId, err := hiero.AccountIDFromString(os.Getenv("OPERATOR_ACCOUNT_ID"))
	if err != nil {
		sh.Logger.Printf("ERROR: error getting operator id OperatorAccountIDFromString: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return

	}
	privateKey, err := hiero.PrivateKeyFromStringEd25519(os.Getenv("OPERATOR_KEY"))
	if err != nil {
		sh.Logger.Printf("ERROR: error getting operator key PrivateKeyFromStringEd25519: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	existingShop, err := sh.ShopStore.GetShopByID(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting existing shop by id GetShopByID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	if existingShop == nil {
		sh.Logger.Printf("ERROR: error getting existing shop by id GetShopByID, existing shop is nil: %v", err)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "shop not found"})
		return
	}

	var updateShopRequest struct {
		Name *string `json:"name"`
		ProfileImageUrl *string `json:"profile_image_url"`
		Campaigns []store.CampaignEntry `json:"campaigns"`
	}

	var updateShopResponse struct {
		Shop *store.Shop `json:"shop"`
		TransactionResponse hiero.TransactionResponse `json:"transaction_response"`
	}

	err = json.NewDecoder(r.Body).Decode(&updateShopRequest)
	if err != nil {
		sh.Logger.Printf("ERROR: error decoding update shop request Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	
	if updateShopRequest.Name != nil {
		existingShop.Name = *updateShopRequest.Name
	}

	if updateShopRequest.ProfileImageUrl != nil {
		existingShop.ProfileImageUrl = *updateShopRequest.ProfileImageUrl
	}

	if len(updateShopRequest.Campaigns) > 0 {
		for i := range updateShopRequest.Campaigns {
			campaignCreationRequest := &updateShopRequest.Campaigns[i]
			tokenSymbol := generateTokenSymbol(campaignCreationRequest.Name)

			transaction, _ := hiero.NewTokenCreateTransaction().
				SetTokenName(campaignCreationRequest.Name).
				SetTokenSymbol(tokenSymbol).
				SetDecimals(2).
				SetInitialSupply(uint64(campaignCreationRequest.Target)).
				SetSupplyType(hiero.TokenSupplyTypeFinite).
				SetMaxSupply(campaignCreationRequest.Target).
				SetTreasuryAccountID(operatorId).
				SetAdminKey(privateKey.PublicKey()).
				SetSupplyKey(privateKey.PublicKey()).
				SetTokenMemo(campaignCreationRequest.Description).
				FreezeWith(sh.Client)

			signedTx := transaction.Sign(privateKey)
			txResponse, _ := signedTx.Execute(sh.Client)
			receipt, _ := txResponse.GetReceipt(sh.Client)
			updateShopResponse.TransactionResponse = txResponse
			tokenId := *receipt.TokenID

			sh.Logger.Printf("Token created: %s\n", tokenId.String())
			campaignCreationRequest.TokenID = tokenId.String()
		}

		existingShop.Campaigns = append(existingShop.Campaigns, updateShopRequest.Campaigns...)
	}

	cm := middleware.GetMerchant(r)
	if cm == nil || cm.IsAnonymous() {
		sh.Logger.Printf("ERROR: error getting current merchant in GetMerchant, current merchant is nil or anonymous")
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "unauthorized"})
		return
	}
	
	shopOwner, err := sh.ShopStore.GetShopOwner(shopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			sh.Logger.Printf("ERROR: error getting shop owner GetShopOwner, shop owner not found")
			utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "shop not found"})
			return
		}
		sh.Logger.Printf("ERROR: error getting shop owner GetShopOwner: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	if shopOwner != cm.ID {
		sh.Logger.Printf("ERROR: error updating shop UpdateShop, shop owner is not the current merchant")
		utils.WriteJSON(w, http.StatusForbidden, utils.Envelope{"error": "forbidden"})
		return
	}
	

	err = sh.ShopStore.UpdateShop(existingShop)
	if err != nil {
		sh.Logger.Printf("ERROR: error updating shop UpdateShop: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	updateShopResponse.Shop = existingShop

	NotifyMerchant(w, cm.TopicID, "campaign_created", sh.Client)

	_ = utils.WriteJSON(w, http.StatusOK, utils.Envelope{"response": updateShopResponse})
}

func (sh *ShopHandler) HandlerGetShopCampaigns(w http.ResponseWriter, r *http.Request) {
	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	campaigns, err := sh.ShopStore.GetShopCampaigns(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop campaigns GetShopCampaigns: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"campaigns": campaigns})
}

func (sh *ShopHandler) HandlerGetShopsByMerchantID(w http.ResponseWriter, r *http.Request) {
	merchantID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting merchant by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	shops, err := sh.ShopStore.GetShopsByMerchantID(merchantID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shops by merchant id GetShopsByMerchantID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"shops": shops})
}

func (sh *ShopHandler) HandlerGetUserCampaignsEntryByShopID(w http.ResponseWriter, r *http.Request) {
	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}


	campaigns, err := sh.ShopStore.GetUserCampaignEntryByShopID(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting user campaigns by shop id GetUserCampaignEntryByShopID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"campaigns": campaigns})
}

func (sh *ShopHandler) HandlerGetShopCampaignsByShopID(w http.ResponseWriter, r *http.Request) {
	shopID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	campaigns, err := sh.ShopStore.GetShopCampaignsByShopID(shopID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop campaigns by shop id GetShopCampaignsByShopID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"campaigns": campaigns})
}

func (sh *ShopHandler) HandlerGetShopCampaignByCampaignID(w http.ResponseWriter, r *http.Request) {
	campaignID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting campaign by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	campaign, err := sh.ShopStore.GetShopCampaignByCampaignID(campaignID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop campaign by campaign id GetShopCampaignByCampaignID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"campaign": campaign})
}

func (sh *ShopHandler) HandlerGetCampaignParticipants(w http.ResponseWriter, r *http.Request) {
	campaignID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error getting campaign by id ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	participants, err := sh.ShopStore.GetCampaignParticipants(campaignID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting campaign participants GetCampaignParticipants: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"participants": participants})
}

func (sh *ShopHandler) HandlerEndCampaign(w http.ResponseWriter, r *http.Request) {
    campaignID, err := utils.ReadIDParam(r, "id")
    if err != nil {
        sh.Logger.Printf("ERROR: error getting campaign by id ReadIDParam: %v", err)
        utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
        return
    }
    err = sh.ShopStore.EndCampaign(campaignID)
    if err != nil {
        sh.Logger.Printf("ERROR: error ending campaign EndCampaign: %v", err)
        utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
        return
    }
    utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "Campaign ended successfully"})

	// TODO: Can be improved by use of message queue
    go func() {
        participants, err := sh.ShopStore.GetCampaignParticipants(campaignID)
        if err != nil {
            sh.Logger.Printf("ERROR: error getting campaign participants: %v", err)
            return
        }

        for _, participant := range participants {
            user, err := sh.UserStore.GetUserByID(participant.UserID)
            if err != nil {
                sh.Logger.Printf("ERROR: error getting user by id: %v", err)
                continue
            }
            NotifyUser(w, user.TopicID, "airdrop", sh.Client)
			sh.Logger.Printf("INFO: notifying user: %s", user.TopicID)
        }
    }()
}


func (sh *ShopHandler) HandleGetCampaignParticipants(w http.ResponseWriter, r *http.Request) {
	var detailedParticipants []struct {
	AccountID string `json:"account_id"`
	TokenBalance int64 `json:"token_balance"`
	UserID string `json:"user_id"`
	UserTopicID string `json:"user_topic_id"`
	}

	campaignID, err := utils.ReadIDParam(r, "id")
	if err != nil {
		sh.Logger.Printf("ERROR: error reading campaign id at ReadIDParam: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	
	campaign, err := sh.ShopStore.GetShopCampaignByCampaignID(campaignID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting shop campaign by campaign id GetShopCampaignByCampaignID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	
	participants, err := sh.ShopStore.GetCampaignParticipants(campaignID)
	if err != nil {
		sh.Logger.Printf("ERROR: error getting campaign participants GetCampaignParticipants: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}

	for _, participant := range participants {
		user, err := sh.UserStore.GetUserByID(participant.UserID)
		if err != nil {
			sh.Logger.Printf("ERROR: error getting user by id GetUserByID: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
			return
		}
		detailedParticipant := struct {
			AccountID string `json:"account_id"`
			TokenBalance int64 `json:"token_balance"`
			UserID string `json:"user_id"`
			UserTopicID string `json:"user_topic_id"`
		}{
			AccountID: user.AccountID,
			TokenBalance: participant.TokenBalance,
			UserID: participant.UserID,
			UserTopicID: user.TopicID,
		}
		detailedParticipants = append(detailedParticipants, detailedParticipant)
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"participants": detailedParticipants, "campaign": campaign})
}

func generateTokenSymbol(name string) string {
	if name == "" {
		return "TKN"
	}
	
	names := strings.Split(name, " ")
	symbol := ""
	for _, namePart := range names {
		if len(namePart) > 0 {
			symbol += strings.ToUpper(namePart[:1])
		}
	}
	
	if len(symbol) < 3 {
		symbol += "TKN"
	}
	
	if len(symbol) > 5 {
		symbol = symbol[:5]
	}
	
	return symbol
}
