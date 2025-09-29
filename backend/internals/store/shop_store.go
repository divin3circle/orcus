package store

import (
	"database/sql"
	"errors"

	"github.com/google/uuid"
)

type Shop struct {
	ID              string          `json:"id"`
	MerchantID      string          `json:"merchant_id"`
	Name            string          `json:"name"`
	Theme           string          `json:"theme"`
	PaymentID       string          `json:"payment_id"`
	ProfileImageUrl string          `json:"profile_image_url"`
	Campaigns       []CampaignEntry `json:"campaigns"`
}

type CampaignEntry struct {
	ID             string `json:"id"`
	ShopID         string `json:"shop_id"`
	Name           string `json:"name"`
	TokenID        string `json:"token_id"`
	Description    string `json:"description"`
	Target         int64  `json:"target"`
	Distributed    int64  `json:"distributed"`
	Ended          int64  `json:"ended"`
	Icon           string `json:"icon"`
	BannerImageUrl string `json:"banner_image_url"`
}

type PostgresShopStore struct {
	db *sql.DB
}

func NewPostgresShopStore(db *sql.DB) *PostgresShopStore {
	return &PostgresShopStore{db: db}
}

type ShopStore interface {
	CreateShop(shop *Shop) (*Shop, error)
	GetShopByID(id string) (*Shop, error)
	UpdateShop(*Shop) error
	GetShopOwner(id string) (string, error)
	GetShopCampaigns(id string) ([]*CampaignEntry, error)
	GetShopCampaignByCampaignID(campaignID string) (*CampaignEntry, error)
	GetShopsByMerchantID(merchantID string) ([]*Shop, error)
	GetShopCampaignsByShopID(shopID string) ([]*CampaignEntry, error)
	GetUserCampaignEntryByShopID(shopID string) ([]*UserCampaignEntry, error)
}

func (pg *PostgresShopStore) CreateShop(shop *Shop) (*Shop, error) {
	tx, err := pg.db.Begin()

	if err != nil {
		return nil, err
	}

	defer tx.Rollback()

	paymentId := uuid.NewString()

	query :=
		`INSERT INTO shops (merchant_id, name, theme, payment_id, profile_image_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err = tx.QueryRow(query, shop.MerchantID, shop.Name, shop.Theme, paymentId, shop.ProfileImageUrl).Scan(&shop.ID)

	if err != nil {
		return nil, err
	}

	for _, campaign := range shop.Campaigns {
		query := `
		INSERT INTO campaigns (shop_id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
		`

		err = tx.QueryRow(query, shop.ID, campaign.Name, campaign.TokenID, campaign.Description, campaign.Target, campaign.Distributed, campaign.Ended, campaign.Icon, campaign.BannerImageUrl).Scan(&campaign.ID)
		if err != nil {
			return nil, err
		}

	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}
	return shop, nil
}

func (pg *PostgresShopStore) GetShopByID(id string) (*Shop, error) {
	shop := &Shop{}
	query := `
	SELECT id, name, theme, payment_id, profile_image_url, merchant_id
	FROM shops
	WHERE id = $1
	`
	err := pg.db.QueryRow(query, id).Scan(&shop.ID, &shop.Name, &shop.Theme, &shop.PaymentID, &shop.ProfileImageUrl, &shop.MerchantID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	campaignQuery := `
	SELECT id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url
	FROM campaigns
	WHERE shop_id = $1
	ORDER BY target_tokens DESC
	`
	campaigns, err := pg.db.Query(campaignQuery, id)
	if err != nil {
		return nil, err
	}
	defer campaigns.Close()

	for campaigns.Next() {
		var campaign CampaignEntry
		err = campaigns.Scan(&campaign.ID, &campaign.Name, &campaign.TokenID, &campaign.Description, &campaign.Target, &campaign.Distributed, &campaign.Ended, &campaign.Icon, &campaign.BannerImageUrl)
		if err != nil {
			return nil, err
		}
		shop.Campaigns = append(shop.Campaigns, campaign)
	}

	return shop, nil
}

func (pg *PostgresShopStore) UpdateShop(shop *Shop) error {
	tx, err := pg.db.Begin()
	if err != nil {
		return err
	}

	defer func(tx *sql.Tx) {
		err := tx.Rollback()
		if err != nil {

		}
	}(tx)

	query := `
	UPDATE shops
	SET name = $1, theme = $2, profile_image_url = $3
	WHERE id = $4
	`

	result, err := tx.Exec(query, shop.Name, shop.Theme, shop.ProfileImageUrl, shop.ID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	_, err = tx.Exec(`
	DELETE FROM campaigns
	WHERE shop_id = $1
	`, shop.ID)
	if err != nil {
		return err
	}

	for _, campaign := range shop.Campaigns {
		query := `
		INSERT INTO campaigns (shop_id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url, participants)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
		`
		_, err = tx.Exec(query, shop.ID, campaign.Name, campaign.TokenID, campaign.Description, campaign.Target, campaign.Distributed, campaign.Ended, campaign.Icon, campaign.BannerImageUrl, 0)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (pg *PostgresShopStore) GetShopOwner(id string) (string, error) {
	var merchantID string
	query := `
	SELECT merchant_id
	FROM shops
	WHERE id = $1
	`

	err := pg.db.QueryRow(query, id).Scan(&merchantID)
	if err != nil {
		return "", err
	}
	return merchantID, nil
}

func (pg *PostgresShopStore) GetShopCampaigns(id string) ([]*CampaignEntry, error) {
	query := `
	SELECT id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url, shop_id
	FROM campaigns
	WHERE shop_id = $1
	`
	campaigns, err := pg.db.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer campaigns.Close()

	result := []*CampaignEntry{}
	for campaigns.Next() {
		var campaign CampaignEntry
		err = campaigns.Scan(&campaign.ID, &campaign.Name, &campaign.TokenID, &campaign.Description, &campaign.Target, &campaign.Distributed, &campaign.Ended, &campaign.Icon, &campaign.BannerImageUrl, &campaign.ShopID)
		if err != nil {
			return nil, err
		}
		result = append(result, &campaign)
	}

	return result, nil
}

func (pg *PostgresShopStore) GetShopsByMerchantID(merchantID string) ([]*Shop, error) {
	shopsQuery := `
	SELECT id, merchant_id, name, theme, payment_id, profile_image_url
	FROM shops
	WHERE merchant_id = $1
	`
	shopsRows, err := pg.db.Query(shopsQuery, merchantID)
	if err != nil {
		return nil, err
	}
	defer shopsRows.Close()

	var shops []*Shop
	for shopsRows.Next() {
		var shop Shop
		err = shopsRows.Scan(
			&shop.ID,
			&shop.MerchantID,
			&shop.Name,
			&shop.Theme,
			&shop.PaymentID,
			&shop.ProfileImageUrl,
		)
		if err != nil {
			return nil, err
		}
		shops = append(shops, &shop)
	}

	for _, shop := range shops {
		campaignsQuery := `
		SELECT id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url, shop_id
		FROM campaigns
		WHERE shop_id = $1
		`
		campaignRows, err := pg.db.Query(campaignsQuery, shop.ID)
		if err != nil {
			return nil, err
		}

		var campaigns []CampaignEntry
		for campaignRows.Next() {
			var campaign CampaignEntry
			err = campaignRows.Scan(
				&campaign.ID,
				&campaign.Name,
				&campaign.TokenID,
				&campaign.Description,
				&campaign.Target,
				&campaign.Distributed,
				&campaign.Ended,
				&campaign.Icon,
				&campaign.BannerImageUrl,
				&campaign.ShopID,
			)
			if err != nil {
				campaignRows.Close()
				return nil, err
			}
			campaigns = append(campaigns, campaign)
		}
		campaignRows.Close()
		shop.Campaigns = campaigns
	}

	return shops, nil
}

func (pg *PostgresShopStore) GetUserCampaignEntryByShopID(shopID string) ([]*UserCampaignEntry, error) {
	query := `
	SELECT id, shop_id, campaign_id, token_balance
	FROM campaigns_entry
	WHERE shop_id = $1
	`
	campaigns, err := pg.db.Query(query, shopID)
	if err != nil {
		return nil, err
	}
	defer campaigns.Close()

	result := []*UserCampaignEntry{}
	for campaigns.Next() {
		var campaign UserCampaignEntry
		err = campaigns.Scan(&campaign.ID, &campaign.ShopID, &campaign.CampaignID, &campaign.TokenBalance)
		if err != nil {
			return nil, err
		}
		result = append(result, &campaign)
	}
	return result, nil
}

func (pg *PostgresShopStore) GetShopCampaignsByShopID(shopID string) ([]*CampaignEntry, error) {
	query := `
	SELECT id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url, shop_id
	FROM campaigns
	WHERE shop_id = $1
	`
	campaigns, err := pg.db.Query(query, shopID)
	if err != nil {
		return nil, err
	}
	defer campaigns.Close()

	result := []*CampaignEntry{}
	for campaigns.Next() {
		var campaign CampaignEntry
		err = campaigns.Scan(&campaign.ID, &campaign.Name, &campaign.TokenID, &campaign.Description, &campaign.Target, &campaign.Distributed, &campaign.Ended, &campaign.Icon, &campaign.BannerImageUrl, &campaign.ShopID)
		if err != nil {
			return nil, err
		}
		result = append(result, &campaign)
	}
	return result, nil
}

func (pg *PostgresShopStore) GetShopCampaignByCampaignID(campaignID string) (*CampaignEntry, error) {
	campaign := &CampaignEntry{}
	query := `
	SELECT id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url, shop_id
	FROM campaigns
	WHERE id = $1
	`
	err := pg.db.QueryRow(query, campaignID).Scan(&campaign.ID, &campaign.Name, &campaign.TokenID, &campaign.Description, &campaign.Target, &campaign.Distributed, &campaign.Ended, &campaign.Icon, &campaign.BannerImageUrl, &campaign.ShopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return campaign, nil
}