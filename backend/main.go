package main

import (
	"github.com/divin3circle/orcus/backend/internals/app"
)

func main() {
	orcus, err := app.NewApplication()

	if err != nil {
		panic(err)
	}

	orcus.Logger.Println("Application running")
}
