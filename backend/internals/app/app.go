package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/divin3circle/orcus/backend/internals/api"
	"github.com/divin3circle/orcus/backend/internals/middleware"
	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/migrations"
	"github.com/joho/godotenv"
)

// Resources to be used around the application
// 1. Hiero Hashgraph client
// 2. Logger
// 3. Postgres Database
// 4. Handlers

type Application struct {
	Logger          *log.Logger
	Port            int
	MerchantHandler *api.MerchantHandler
	ShopHandler     *api.ShopHandler
	TokenHandler    *api.TokenHandler
	Middleware      *middleware.MerchantMiddleware
	DB              *sql.DB
}

func loadEnvironmentVariables() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	fmt.Println("Environment variables loaded successfully")
}

func NewApplication() (*Application, error) {
	loadEnvironmentVariables()
	strport := os.Getenv("PORT")

	pgDB, err := store.Open()
	if err != nil {
		return nil, err
	}

	port, err := strconv.Atoi(strport)
	if err != nil {
		fmt.Printf("Failed to parse PORT env variable: %v\n", err)
		fmt.Println("Will use default PORT if --port isn't used")
		port = 8080
	}
	err = store.MigrateFS(pgDB, migrations.FS, ".")
	if err != nil {
		panic(err)
	}

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)
	// stores
	shopStore := store.NewPostgresShopStore(pgDB)
	merchantStore := store.NewPostgresMerchantStore(pgDB)
	tokenStore := store.NewPostgresTokenStore(pgDB)

	// handlers
	mh := api.NewMerchantHandler(merchantStore, logger)
	sh := api.NewShopHandler(shopStore, logger)
	th := api.NewTokenHandler(tokenStore, merchantStore, logger)
	mwh := middleware.NewMerchantMiddleware(merchantStore)

	app := &Application{
		Logger:          logger,
		Port:            port,
		MerchantHandler: mh,
		ShopHandler:     sh,
		TokenHandler:    th,
		Middleware:      mwh,
		DB:              pgDB,
	}
	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	_, _ = fmt.Fprintf(w, "Status is healthy.")
}
