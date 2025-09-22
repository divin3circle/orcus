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
	MobileNumber    string    `json:"mobile_number"`
	PasswordHash    password  `json:"-"`
	EncryptedKey    string    `json:"-"`
	AccountID       string    `json:"account_id"`
	ProfileImageUrl string    `json:"profile_image_url"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	DeletedAt       time.Time `json:"deleted_at"`
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
	UpdateUser(user *User) error
	GetUserToken(scope, tokenPlainText string) (*User, error)
}

func (pu *PostgresUserStore) CreateUser(user *User) (*User, error) {
	query := `
	INSERT INTO users (username, mobile_number, hashed_password, encrypted_key, account_id, profile_image_url)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id, created_at, updated_at;
	`

	err := pu.db.QueryRow(query, user.Username, user.MobileNumber, user.PasswordHash.hash, user.EncryptedKey, user.AccountID, user.ProfileImageUrl).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
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
	SELECT id, username, mobile_number, hashed_password, encrypted_key, account_id, profile_image_url, created_at, updated_at
	FROM users
	WHERE username = $1
	`
	err := pu.db.QueryRow(query, username).Scan(&user.ID, &user.Username, &user.MobileNumber, &user.PasswordHash.hash, &user.EncryptedKey, &user.AccountID, &user.ProfileImageUrl, &user.CreatedAt, &user.UpdatedAt)
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
