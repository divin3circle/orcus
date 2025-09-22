package store

import (
	"database/sql"
	"time"

	"github.com/divin3circle/orcus/backend/internals/tokens"
)


type PostgresTokenStore struct {
	db *sql.DB
}

func NewPostgresTokenStore(db *sql.DB) *PostgresTokenStore {
	return &PostgresTokenStore{db: db}
}

type TokenStore interface {
	Insert(token *tokens.Token) error
	Create(merchantID string, ttl time.Duration, scope string) (*tokens.Token, error)
	DeleteAllForUser(scope string, userID string) error
}

func (pt *PostgresTokenStore) Insert(token *tokens.Token) error {
	query := `
	INSERT INTO tokens(hash, user_id, merchant_id, expiry, scope)
	VALUES ($1, $2, $3, $4, $5)
	`
	_, err := pt.db.Exec(query, token.Hash, nil, token.MerchantID, token.Expiry, token.Scope)
	return err
}

func (pt *PostgresTokenStore) Create(merchantID string, ttl time.Duration, scope string) (*tokens.Token, error) {
	token, err := tokens.GenerateMerchantToken(merchantID, ttl, scope)
	if err != nil {
		return  nil, err
	}

	err = pt.Insert(token)
	
	return  token, err
}

func (pt *PostgresTokenStore) DeleteAllForUser(scope string, userID string) error {
	query := `
	DELETE FROM tokens
	WHERE user_id = $1 AND scope = $2
	`
	_, err := pt.db.Exec(query, userID, scope)
	return err
}