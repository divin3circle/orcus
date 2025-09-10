package app

import (
	"log"
	"os"
)

// Resources to be used around the application
// 1. Hiero Hashgraph client
// 2. Logger
// 3. Postgres Database

type Application struct {
	Logger *log.Logger
}

func NewApplication() (*Application, error) {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)
	app := &Application{
		Logger: logger,
	}
	return app, nil
}
