package store

import (
	"database/sql"
	"github.com/stretchr/testify/require"
	"testing"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/stretchr/testify/assert"
)

func setUpTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("pgx", "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable")
	if err != nil {
		t.Fatal("opening test database:", err)
	}

	err = Migrate(db, "../../migrations/")
	if err != nil {
		t.Fatal("migrating test database:", err)
	}

	_, err = db.Exec(`TRUNCATE shops, campaigns CASCADE;`)
	if err != nil {
		t.Fatal("dropping test database:", err)
	}

	return db
}

func TestCreateShop(t *testing.T) {
	db := setUpTestDB(t)
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			t.Fatal("closing test database:", err)
		}
	}(db)

	shop := NewPostgresShopStore(db)
	tests := []struct {
		name    string
		shop    *Shop
		wantErr bool
	}{
		{
			name: "valid workout",
			shop: &Shop{
				ID:              1,
				Name:            "Test Shop",
				PaymentID:       "testId0001",
				ProfileImageUrl: "testing.com",
				Campaigns: []CampaignEntry{
					{
						ID:             1,
						Name:           "Test Campaign",
						TokenID:        "testId0001",
						Description:    "Test Description",
						Target:         90000,
						Distributed:    0,
						Ended:          0,
						Icon:           "icon.com",
						BannerImageUrl: "testing.com",
					},
				},
			},
			wantErr: false,
		},
		{
			name: "invalid workout",
			shop: &Shop{
				ID:              1,
				Name:            "Test Shop 2",
				PaymentID:       "testId0002",
				ProfileImageUrl: "testing.com",
				Campaigns: []CampaignEntry{
					{
						ID:             1,
						Name:           "Test Campaign 1",
						TokenID:        "testId0002",
						Description:    "Test Description",
						Target:         90000,
						Distributed:    0,
						Ended:          90,
						Icon:           "icon.com",
						BannerImageUrl: "testing.com",
					},
				},
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			createdShop, err := shop.CreateShop(tt.shop)
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			require.NoError(t, err)
			assert.NotEmpty(t, createdShop.ID)
			assert.Equal(t, createdShop.Name, tt.shop.Name)
			assert.Equal(t, createdShop.PaymentID, tt.shop.PaymentID)

			retrieved, err := shop.GetShopByID(createdShop.ID)
			require.NoError(t, err)
			assert.Equal(t, createdShop.ID, retrieved.ID)
			assert.Equal(t, createdShop.Name, retrieved.Name)
			assert.Equal(t, len(createdShop.Campaigns), len(retrieved.Campaigns))

			for i, entry := range createdShop.Campaigns {
				assert.Equal(t, entry.Name, retrieved.Campaigns[i].Name)
				assert.Equal(t, entry.Target, retrieved.Campaigns[i].Target)
			}
		})
	}

}
