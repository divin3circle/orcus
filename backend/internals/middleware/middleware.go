package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/tokens"
	"github.com/divin3circle/orcus/backend/internals/utils"
)


type MerchantMiddleware struct {
	MerchantStore store.MerchantStore
}

func NewMerchantMiddleware(merchantStore store.MerchantStore) *MerchantMiddleware {
	return &MerchantMiddleware{MerchantStore: merchantStore}
}

type contextKey string

const MerchantContextKey = contextKey("merchant")

func SetMerchant(r *http.Request, merchant *store.Merchant) *http.Request {
	// ctx := context.WithValue(r.Context(), MerchantContextKey, merchant)
	// return r.WithContext(ctx)

	return r.WithContext(context.WithValue(r.Context(), MerchantContextKey, merchant))
}

func GetMerchant(r *http.Request) *store.Merchant {
	merchant, ok := r.Context().Value(MerchantContextKey).(*store.Merchant)
	if !ok {
		panic("merchant not found in context")
	}
	return merchant
}

func (mm *MerchantMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Vary", "Authorization")
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			r = SetMerchant(r, store.AnonymousMerchant)
			next.ServeHTTP(w, r)
			return
		}

		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid authorization header"})
			return
		}

		tokenPlainText := headerParts[1]
		merchant, err := mm.MerchantStore.GetMerchantToken(tokens.ScopeAuthentication, tokenPlainText)
		if err != nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid token"})
			return
		}
		if merchant == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "token expired or not found"})
			return
		}

		r = SetMerchant(r, merchant)
		next.ServeHTTP(w, r)
	})
}

func (mm *MerchantMiddleware) RequireAuthenticatedMerchant(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
		merchant := GetMerchant(r)
		if merchant.IsAnonymous() {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "unauthorized"})
			return
		}
		next.ServeHTTP(w, r)
	})
}