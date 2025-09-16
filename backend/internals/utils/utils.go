package utils

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type Envelope map[string]any

func WriteJSON(w http.ResponseWriter, status int, data Envelope) error{
	js, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}

	js = append(js, '\n')
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(js)
	if err != nil {
		return err
	}
	return nil
}

func ReadIDParam(r *http.Request, name string) (int64, error) {
	idParam := chi.URLParam(r, name)
	if idParam == "" {
		return 0, errors.New("id is required")
	}
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		return 0, errors.New("failed to parse id: " + err.Error())
	}
	return id, nil
}
