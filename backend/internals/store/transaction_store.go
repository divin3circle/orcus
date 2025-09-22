package store

import (
	"database/sql"
	"time"
)

type Transaction struct {
	ID string `json:"id"`
	ShopID string `json:"shop_id"`
	UserID string `json:"user_id"`
	MerchantID string `json:"merchant_id"`
	Amount int64 `json:"amount"`
	Fee int64 `json:"fee"`
	Status string `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PostgresTransactionStore struct {
	db *sql.DB
}

func NewPostgresTransactionStore(db *sql.DB) *PostgresTransactionStore {
	return &PostgresTransactionStore{db: db}
}

type TransactionStore interface {
	CreateTransaction(transaction *Transaction) (*Transaction, error)
	GetTransactionByID(id string) (*Transaction, error)
	GetTransactionsByShopID(shopID string) ([]*Transaction, error)
	GetTransactionsByUserID(userID string) ([]*Transaction, error)
	GetTransactionsByMerchantID(merchantID string) ([]*Transaction, error)
}

func (pt *PostgresTransactionStore) CreateTransaction(transaction *Transaction) (*Transaction, error) {
	query := `
	INSERT INTO transactions (shop_id, user_id, merchant_id, amount, fee, status)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id, status, created_at, updated_at;
	`

	err := pt.db.QueryRow(query, transaction.ShopID, transaction.UserID, transaction.MerchantID, transaction.Amount, transaction.Fee, transaction.Status).Scan(&transaction.ID, &transaction.Status, &transaction.CreatedAt, &transaction.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return transaction, nil
}

func (pt *PostgresTransactionStore) GetTransactionByID(id string) (*Transaction, error) {
	var transaction = &Transaction{}
	query := `
	SELECT id, shop_id, user_id, merchant_id, amount, fee, status, created_at, updated_at
	FROM transactions
	WHERE id = $1
	`

	err := pt.db.QueryRow(query, id).Scan(&transaction.ID, &transaction.ShopID, &transaction.UserID, &transaction.MerchantID, &transaction.Amount, &transaction.Fee, &transaction.Status, &transaction.CreatedAt, &transaction.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return transaction, nil
}

func (pt *PostgresTransactionStore) GetTransactionsByShopID(shopID string) ([]*Transaction, error) {
	query := `
	SELECT id, shop_id, user_id, merchant_id, amount, fee, status, created_at, updated_at
	FROM transactions
	WHERE shop_id = $1
	`

	rows, err := pt.db.Query(query, shopID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*Transaction
	for rows.Next() {
		var transaction = &Transaction{}
		err = rows.Scan(&transaction.ID, &transaction.ShopID, &transaction.UserID, &transaction.MerchantID, &transaction.Amount, &transaction.Fee, &transaction.Status, &transaction.CreatedAt, &transaction.UpdatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}
	return transactions, nil
}

func (pt *PostgresTransactionStore) GetTransactionsByUserID(userID string) ([]*Transaction, error) {
	query := `
	SELECT id, shop_id, user_id, merchant_id, amount, fee, status, created_at, updated_at
	FROM transactions
	WHERE user_id = $1
	`

	rows, err := pt.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*Transaction
	for rows.Next() {
		var transaction = &Transaction{}
		err = rows.Scan(&transaction.ID, &transaction.ShopID, &transaction.UserID, &transaction.MerchantID, &transaction.Amount, &transaction.Fee, &transaction.Status, &transaction.CreatedAt, &transaction.UpdatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}
	return transactions, nil
}

func (pt *PostgresTransactionStore) GetTransactionsByMerchantID(merchantID string) ([]*Transaction, error) {
	query := `
	SELECT id, shop_id, user_id, merchant_id, amount, fee, status, created_at, updated_at
	FROM transactions
	WHERE merchant_id = $1
	`

	rows, err := pt.db.Query(query, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*Transaction
	for rows.Next() {
		var transaction = &Transaction{}
		err = rows.Scan(&transaction.ID, &transaction.ShopID, &transaction.UserID, &transaction.MerchantID, &transaction.Amount, &transaction.Fee, &transaction.Status, &transaction.CreatedAt, &transaction.UpdatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}
	return transactions, nil
}