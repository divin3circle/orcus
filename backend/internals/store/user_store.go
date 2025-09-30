package store

import (
	"crypto/sha256"
	"database/sql"
	"errors"
	"time"
)

type User struct {
	ID              string    `json:"id"`
	Username        string    `json:"username"`
	TopicID         string    `json:"topic_id"`
	MobileNumber    string    `json:"mobile_number"`
	PasswordHash    password  `json:"-"`
	EncryptedKey    string    `json:"-"`
	AccountID       string    `json:"account_id"`
	ProfileImageUrl string    `json:"profile_image_url"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	DeletedAt       time.Time `json:"deleted_at"`
}

type Purchase struct {
	ID string `json:"id"`
	UserID string `json:"user_id"`
	Amount int64 `json:"amount"`
	Status string `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserCampaignEntry struct {
	ID string `json:"id"`
	ShopID sql.NullString `json:"shop_id"`
	CampaignID string `json:"campaign_id"`
	TokenBalance int64 `json:"token_balance"`
}

var AnonymousUser = &User{}

func (u User) IsAnonymous() bool {
	return u.ID == AnonymousUser.ID
}

type PostgresUserStore struct {
	db *sql.DB
}

func NewPostgresUserStore(db *sql.DB) *PostgresUserStore {
	return &PostgresUserStore{db: db}
}

type UserStore interface {
	CreateUser(user *User) (*User, error)
	GetUserByUsername(username string) (*User, error)
	GetUserByID(id string) (*User, error)
	UpdateUser(user *User) error
	GetUserToken(scope, tokenPlainText string) (*User, error)
	BuyToken(userID string, amount int64) error
	GetUserPurchases(userID string) ([]*Purchase, error)
	JoinCampaign(userID string, campaignID string, tokenBalance int64) error
	UpdateCampaignEntry(userID string, campaignID string, tokenBalance int64) error
	IsParticipant(userID string, campaignID string) (bool, error)
	GetUserCampaigns(userID string) ([]*UserCampaignEntry, error)
}

func (pu *PostgresUserStore) CreateUser(user *User) (*User, error) {
	query := `
	INSERT INTO users (username, topic_id, mobile_number, hashed_password, encrypted_key, account_id, profile_image_url)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id, created_at, updated_at;
	`

	err := pu.db.QueryRow(query, user.Username, user.TopicID, user.MobileNumber, user.PasswordHash.hash, user.EncryptedKey, user.AccountID, user.ProfileImageUrl).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (pu *PostgresUserStore) GetUserByUsername(username string) (*User, error) {
	user := &User{
		PasswordHash: password{},
	}

	query := `
	SELECT id, username, topic_id, mobile_number, hashed_password, encrypted_key, account_id, profile_image_url, created_at, updated_at
	FROM users
	WHERE username = $1
	`
	err := pu.db.QueryRow(query, username).Scan(&user.ID, &user.Username, &user.TopicID, &user.MobileNumber, &user.PasswordHash.hash, &user.EncryptedKey, &user.AccountID, &user.ProfileImageUrl, &user.CreatedAt, &user.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (pu *PostgresUserStore) GetUserByID(id string) (*User, error) {
	user := &User{
		PasswordHash: password{},
	}
	
	query := `
	SELECT id, username, topic_id, mobile_number, hashed_password, encrypted_key, account_id, profile_image_url, created_at, updated_at
	FROM users
	WHERE id = $1
	`
	err := pu.db.QueryRow(query, id).Scan(&user.ID, &user.Username, &user.TopicID, &user.MobileNumber, &user.PasswordHash.hash, &user.EncryptedKey, &user.AccountID, &user.ProfileImageUrl, &user.CreatedAt, &user.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (pu *PostgresUserStore) UpdateUser(user *User) error {
	query := `
	UPDATE users
	SET username = $1, mobile_number = $2, hashed_password = $3, encrypted_key = $4, account_id = $5, profile_image_url = $6, updated_at = CURRENT_TIMESTAMP
	WHERE id = $7
	RETURNING updated_at
	`
	err := pu.db.QueryRow(query, user.Username, user.MobileNumber, user.PasswordHash.hash, user.EncryptedKey, user.AccountID, user.ProfileImageUrl, user.ID).Scan(&user.UpdatedAt)
	if err != nil {
		return err
	}
	return nil
}

func (pu *PostgresUserStore) GetUserToken(scope, tokenPlainText string) (*User, error) {
	tokenHash := sha256.Sum256([]byte(tokenPlainText))

	query := `
	SELECT users.id, users.username, users.mobile_number, users.hashed_password, users.encrypted_key, users.account_id, users.profile_image_url, users.created_at, users.updated_at
	FROM users
	INNER JOIN user_tokens ON users.id = user_tokens.user_id
	WHERE user_tokens.hash = $1 AND user_tokens.scope = $2 AND user_tokens.expiry > $3
	`

	user := &User{
		PasswordHash: password{},
	}

	err := pu.db.QueryRow(query, tokenHash[:], scope, time.Now()).Scan(&user.ID, &user.Username, &user.MobileNumber, &user.PasswordHash.hash, &user.EncryptedKey, &user.AccountID, &user.ProfileImageUrl, &user.CreatedAt, &user.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (pu *PostgresUserStore) BuyToken(userID string, amount int64) error {
	var purchase Purchase
	query := `
	INSERT INTO purchases (user_id, amount, status)
	VALUES ($1, $2, 'confirmed')
	RETURNING id, user_id, amount, status, created_at, updated_at
	`
	err := pu.db.QueryRow(query, userID, amount).Scan(&purchase.ID, &purchase.UserID, &purchase.Amount, &purchase.Status, &purchase.CreatedAt, &purchase.UpdatedAt)
	if err != nil {
		return err
	}
	return nil
}

func (pu *PostgresUserStore) GetUserPurchases(userID string) ([]*Purchase, error) {
	query := `
	SELECT id, user_id, amount, status, created_at, updated_at
	FROM purchases
	WHERE user_id = $1
	`
	rows, err := pu.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	purchases := []*Purchase{}
	for rows.Next() {
		var purchase Purchase
		err := rows.Scan(&purchase.ID, &purchase.UserID, &purchase.Amount, &purchase.Status, &purchase.CreatedAt, &purchase.UpdatedAt)
		if err != nil {
			return nil, err
		}
		purchases = append(purchases, &purchase)
	}
	return purchases, nil
}

func (pu *PostgresUserStore) JoinCampaign(userID string, campaignID string, tokenBalance int64) error {
	isParticipant, err := pu.IsParticipant(userID, campaignID)
	if err != nil {
		return err
	}
	
	if isParticipant {
		return errors.New("user is already participating in this campaign")
	}
	
	tx, err := pu.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	query := `
	INSERT INTO campaigns_entry (user_id, campaign_id, token_balance)
	VALUES ($1, $2, $3)
	`
	_, err = tx.Exec(query, userID, campaignID, tokenBalance)
	if err != nil {
		return err
	}
	
	updateQuery := `
	UPDATE campaigns 
	SET distributed = distributed + $1 
	WHERE id = $2
	`
	_, err = tx.Exec(updateQuery, tokenBalance, campaignID)
	if err != nil {
		return err
	}
	
	return tx.Commit()
}

func (pg *PostgresUserStore) UpdateCampaignEntry(userID string, campaignID string, tokenIncrement int64) error {
    tx, err := pg.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()
    
    query := `
        UPDATE campaigns_entry 
        SET token_balance = token_balance + $1 
        WHERE user_id = $2 AND campaign_id = $3
    `
    
    result, err := tx.Exec(query, tokenIncrement, userID, campaignID)
    if err != nil {
        return err
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rowsAffected == 0 {
        return errors.New("no campaign entry found for user")
    }
    
    updateQuery := `
        UPDATE campaigns 
        SET distributed = distributed + $1 
        WHERE id = $2
    `
    _, err = tx.Exec(updateQuery, tokenIncrement, campaignID)
    if err != nil {
        return err
    }
    
    return tx.Commit()
}

func (pu *PostgresUserStore) IsParticipant(userID string, campaignID string) (bool, error) {
	query := `
	SELECT EXISTS(SELECT 1 FROM campaigns_entry WHERE user_id = $1 AND campaign_id = $2)
	`
	var exists bool
	err := pu.db.QueryRow(query, userID, campaignID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (pu *PostgresUserStore) GetUserCampaigns(userID string) ([]*UserCampaignEntry, error) {
	query := `
	SELECT id, shop_id, campaign_id, token_balance
	FROM campaigns_entry
	WHERE user_id = $1
	`
	campaigns, err := pu.db.Query(query, userID)
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