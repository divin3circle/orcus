package store

import (
	"database/sql"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type password struct {
	plainText string
	hash      []byte
}

func (p *password) Set(plainText string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plainText), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	p.plainText = plainText
	p.hash = hash
	return nil
}

func (p *password) Matches(plainText string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(plainText))
	if err != nil {
		switch {
			case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
				return false, nil
			default:
				return false, err
		}
	}
	return true, nil
}

func (p *password) String() string {
	return p.plainText
}

type Merchant struct {
	ID                    int64     `json:"id"`
	Username              string    `json:"username"`
	MobileNumber          string    `json:"mobile_number"`
	PasswordHash          password  `json:"-"`
	AccountID             string    `json:"account_id"`
	ProfileImageUrl       string    `json:"profile_image_url"`
	AccountBannerImageUrl string    `json:"account_banner_image_url"`
	AutoOfframp           bool      `json:"auto_offramp"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
	DeletedAt             time.Time `json:"deleted_at"`
}

type PostgresMerchantStore struct {
	db *sql.DB
}

func NewPostgresMerchantStore(db *sql.DB) *PostgresMerchantStore {
	return &PostgresMerchantStore{db: db}
}

type MerchantStore interface {
	CreateMerchant(merchant *Merchant) (*Merchant, error)
	GetMerchantByUsername(username string) (*Merchant, error)
	UpdateMerchant(merchant *Merchant) error
}

func (pg *PostgresMerchantStore) CreateMerchant(merchant *Merchant) (*Merchant, error) {
	query := `
	INSERT INTO merchants (username, mobile_number, password_hash, account_id, profile_image_url, account_banner_image_url)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id, created_at, updated_at;
	`

	err := pg.db.QueryRow(query, merchant.Username, merchant.MobileNumber, merchant.PasswordHash.hash, merchant.AccountID, merchant.ProfileImageUrl, merchant.AccountBannerImageUrl).Scan(&merchant.ID, &merchant.CreatedAt, &merchant.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return merchant, nil
}

func (pg *PostgresMerchantStore) GetMerchantByUsername(username string) (*Merchant, error) {
	merchant := &Merchant{
		PasswordHash: password{},
	}

	query := `
	SELECT id, username, mobile_number, password_hash, account_id, profile_image_url, account_banner_image_url, created_at, updated_at
    FROM merchants WHERE username = $1
	`

	err := pg.db.QueryRow(query, username).Scan(&merchant.ID, &merchant.Username, &merchant.MobileNumber, &merchant.PasswordHash.hash, &merchant.AccountID, &merchant.ProfileImageUrl, &merchant.AccountBannerImageUrl, &merchant.CreatedAt, &merchant.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return merchant, nil
}

func (pg *PostgresMerchantStore) UpdateMerchant(merchant *Merchant) error {
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
	UPDATE merchants
	SET username = $1, mobile_number= $2, password_hash= $3, profile_image_url= $4, account_banner_image_url= $5, auto_offramp= $6, updated_at = CURRENT_TIMESTAMP 
	WHERE id = $7
	RETURNING updated_at
    `

	result, err := tx.Exec(query, merchant.Username, merchant.MobileNumber, merchant.PasswordHash.hash, merchant.ProfileImageUrl, merchant.AccountBannerImageUrl, merchant.AutoOfframp, merchant.ID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return sql.ErrNoRows
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}
