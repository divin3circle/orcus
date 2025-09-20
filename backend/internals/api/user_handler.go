package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/divin3circle/orcus/backend/internals/store"
	"github.com/divin3circle/orcus/backend/internals/utils"
	"github.com/go-chi/chi/v5"
)


type UserRegisterRequest struct {
	Username string `json:"username"`
	MobileNumber string `json:"mobile_number"`
	Password string `json:"password"`
	EncryptedKey string `json:"encrypted_key"`
	AccountID string `json:"account_id"`
	ProfileImageUrl string `json:"profile_image_url"`
}

type UserHandler struct {
	UserStore store.UserStore
	Logger *log.Logger
}

func NewUserHandler(userStore store.UserStore, logger *log.Logger) *UserHandler {
	return &UserHandler{UserStore: userStore, Logger: logger}
}

func (uh *UserHandler) HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req UserRegisterRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error decoding user register request body at Decode: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	
	err = uh.validateRegisterRequest(&req)
	if err != nil {
		uh.Logger.Printf("ERROR: error validating user register request at validateRegisterRequest: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	
	user := &store.User{
		Username: req.Username,
		MobileNumber: req.MobileNumber,
		EncryptedKey: req.EncryptedKey,
		AccountID: req.AccountID,
		ProfileImageUrl: req.ProfileImageUrl,
	}
	err = user.PasswordHash.Set(req.Password)
	if err != nil {
		uh.Logger.Printf("ERROR: error hashing password at Set: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}
	
	createdUser, err := uh.UserStore.CreateUser(user)
	if err != nil {
		uh.Logger.Printf("ERROR: error creating user at CreateUser: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"user": createdUser})
}

func (uh *UserHandler) HandleGetUserByUsername(w http.ResponseWriter, r *http.Request) {
	userUsername := chi.URLParam(r, "username")
	if userUsername == "" {
		uh.Logger.Printf("ERROR: error reading user username in chi.URLParam: %v", userUsername)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": userUsername})
		return
	}
	
	user, err := uh.UserStore.GetUserByUsername(userUsername)
	if err != nil {
		uh.Logger.Printf("ERROR: error getting user by username in GetUserByUsername: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"user": user})
}


func (uh *UserHandler) validateRegisterRequest(registerRequest *UserRegisterRequest) error {
	if registerRequest.Username == "" {
		return errors.New("username is required")
	}
	if registerRequest.MobileNumber == "" {
		return errors.New("mobile number is required")
	}
	if registerRequest.Password == "" {
		return errors.New("password is required")
	}
	if registerRequest.ProfileImageUrl == "" {
		return errors.New("profile image url is required")
	}
	if len(registerRequest.MobileNumber) != 13 {
		return errors.New("mobile number must be 13 digits")
	}
	if len(registerRequest.Password) < 6 {
		return errors.New("password must be at least 6 characters long")
	}
	if len(registerRequest.Username) < 3 || len(registerRequest.Username) > 50 {
		return errors.New("username must be between 3 and 50 characters long")
	}
	if registerRequest.EncryptedKey == "" {
		return errors.New("encrypted key is required")
	}
	return nil
}