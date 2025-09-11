package store

import "database/sql"

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
}

func (pg *PostgresShopStore) CreateShop(shop *Shop) (*Shop, error) {
	tx, err := pg.db.Begin()

	if err != nil {
		return nil, err
	}

	defer tx.Rollback()

	query :=
		`INSERT INTO shops (name, profile_image_url)
		VALUES ($1, $2)
		RETURNING id
	`

	err = tx.QueryRow(query, shop.Name, shop.ProfileImageUrl).Scan(&shop.ID)

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
	// temp sol to satisfy shop store interface
	return shop, nil
}
