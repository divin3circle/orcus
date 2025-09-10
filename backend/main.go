package main

import (
	"flag"
	"fmt"
	"github.com/divin3circle/orcus/backend/internals/app"
	"github.com/divin3circle/orcus/backend/internals/routes"
	"net/http"
	"time"
)

func main() {
	orcus, err := app.NewApplication()

	if err != nil {
		panic(err)
	}

	var port int
	flag.IntVar(&port, "port", orcus.Port, "backend sever port")
	flag.Parse()

	orcus.Logger.Println("Application running")

	r := routes.SetUpRoutes(orcus)

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", port),
		Handler:           r,
		IdleTimeout:       time.Minute,
		ReadHeaderTimeout: time.Second * 10,
		WriteTimeout:      time.Second * 30,
	}

	orcus.Logger.Printf("Listening on port: %d", port)

	err = server.ListenAndServe()

	if err != nil {
		orcus.Logger.Fatal(err)
	}
}
