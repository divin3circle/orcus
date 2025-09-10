package app

import (
	"fmt"
	"github.com/divin3circle/orcus/backend/internals/api"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"strconv"
)

// Resources to be used around the application
// 1. Hiero Hashgraph client
// 2. Logger
// 3. Postgres Database

type Application struct {
	Logger          *log.Logger
	Port            int
	MerchantHandler *api.MerchantHandler
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
	port, err := strconv.Atoi(strport)
	if err != nil {
		fmt.Printf("Failed to parse PORT env variable: %v\n", err)
		fmt.Println("Will use default PORT if --port isn't used")
		port = 8080
	}
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)
	// stores

	// handlers
	mh := api.NewMerchantHandler()

	app := &Application{
		Logger:          logger,
		Port:            port,
		MerchantHandler: mh,
	}
	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	_, _ = fmt.Fprintf(w, "Status is healthy.")
}
