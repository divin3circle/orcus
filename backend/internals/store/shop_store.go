package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Shop struct {
	ID              int64           `json:"id"`
	Name            string          `json:"name"`
	PaymentID       string          `json:"payment_id"`
	ProfileImageUrl string          `json:"profile_image_url"`
	Campaigns       []CampaignEntry `json:"campaigns"`
}

type CampaignEntry struct {
	ID             int64  `json:"id"`
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
	GetShopByID(id int64) (*Shop, error)
	UpdateShop(*Shop) error
}

func (pg *PostgresShopStore) CreateShop(shop *Shop) (*Shop, error) {
	tx, err := pg.db.Begin()

	if err != nil {
		return nil, err
	}

	defer tx.Rollback()
	
	paymentId := uuid.NewString();

	query :=
		`INSERT INTO shops (name, payment_id, profile_image_url)
		VALUES ($1, $2, $3)
		RETURNING id
	`

	err = tx.QueryRow(query, shop.Name, paymentId, shop.ProfileImageUrl).Scan(&shop.ID)

	if err != nil {
		return nil, err
	}

	for _, campaign := range shop.Campaigns {
		query := `
		INSERT INTO campaigns (shop_id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
		`

		err = tx.QueryRow(query, shop.ID, campaign.Name, campaign.TokenID, campaign.Description, campaign.Target, campaign.Distributed, campaign.Ended, campaign.Icon, campaign.BannerImageUrl).Scan(&shop.ID)
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

func (pg *PostgresShopStore) GetShopByID(id int64) (*Shop, error) {
	shop := &Shop{}
	query := `
	SELECT id, name, payment_id, profile_image_url
	FROM shops
	WHERE id = $1
	`
	err := pg.db.QueryRow(query, id).Scan(&shop.ID, &shop.Name, &shop.PaymentID, &shop.ProfileImageUrl)
	if err == sql.ErrNoRows{
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

	for campaigns.Next(){
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

	defer tx.Rollback()

	query := `
	UPDATE shops
	SET name = $1, profile_image_url = $2
	WHERE id = $3
	`

	result, err := tx.Exec(query, shop.Name, shop.ProfileImageUrl, shop.ID)
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
		INSERT INTO campaigns (shop_id, name, token_id, description, target_tokens, distributed, ended, icon, banner_image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
		`
		_, err = tx.Exec(query, shop.ID, campaign.Name, campaign.TokenID, campaign.Description, campaign.Target, campaign.Distributed, campaign.Ended, campaign.Icon, campaign.BannerImageUrl)
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