package tokens

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"time"
)

const (
	ScopeAuthentication = "authentication"
)

type Token struct {
	Plaintext string `json:"token"`
	Hash []byte `json:"-"`
	UserID string `json:"-"`
	MerchantID string `json:"-"`
	Expiry time.Time `json:"expiry"`
	Scope string `json:"-"`
}

func GenerateToken(userID, merchantID string, ttl time.Duration, scope string) (*Token, error) {
	token := &Token{
		UserID: userID,
		MerchantID: merchantID,
		Expiry: time.Now().Add(ttl),
		Scope: scope,
	}

	emptyBytes := make([]byte, 32)
	_, err := rand.Read(emptyBytes)
	if err != nil {
		return nil, err
	}

	token.Plaintext = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(emptyBytes)
	hash := sha256.Sum256([]byte(token.Plaintext))
	token.Hash = hash[:]

	return token, nil
}

type UserToken struct {
	Plaintext string `json:"token"`
	Hash []byte `json:"-"`
	UserID string `json:"-"`
	Expiry time.Time `json:"expiry"`
	Scope string `json:"-"`
}

func GenerateUserToken(userID string, ttl time.Duration, scope string) (*UserToken, error) {
	token := &UserToken{
		UserID: userID,
		Expiry: time.Now().Add(ttl),
		Scope: scope,
	}

	emptyBytes := make([]byte, 32)
	_, err := rand.Read(emptyBytes)
	if err != nil {
		return nil, err
	}

	token.Plaintext = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(emptyBytes)
	hash := sha256.Sum256([]byte(token.Plaintext))
	token.Hash = hash[:]

	return token, nil
}