package store

import (
	"database/sql"
	"time"

	"github.com/divin3circle/orcus/backend/internals/tokens"
)

type PostgresUserTokenStore struct {
	db *sql.DB
}

func NewPostgresUserTokenStore(db *sql.DB) *PostgresUserTokenStore {
	return &PostgresUserTokenStore{db: db}
}

type UserTokenStore interface {
	Insert(token *tokens.UserToken) error
	Create(userID string, ttl time.Duration, scope string) (*tokens.UserToken, error)
	DeleteAllForUser(scope string, userID string) error
}

func (pt *PostgresUserTokenStore) Insert(token *tokens.UserToken) error {
	query := `
	INSERT INTO user_tokens(hash, user_id, expiry, scope)
	VALUES ($1, $2, $3, $4)
	`
	_, err := pt.db.Exec(query, token.Hash, token.UserID, token.Expiry, token.Scope)
	return err
}

func (pt *PostgresUserTokenStore) Create(userID string, ttl time.Duration, scope string) (*tokens.UserToken, error) {
	token, err := tokens.GenerateUserToken(userID, ttl, scope)
	if err != nil {
		return nil, err
	}

	err = pt.Insert(token)
	
	return token, err
}

func (pt *PostgresUserTokenStore) DeleteAllForUser(scope string, userID string) error {
	query := `
	DELETE FROM user_tokens
	WHERE user_id = $1 AND scope = $2
	`
	_, err := pt.db.Exec(query, userID, scope)
	return err
}
