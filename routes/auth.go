package routes

//This file contains all the routes that have to do with authentication

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/models"
	"github.com/unexpectedtokens/mealr/util"
)

// RegisterView is a function to register a user
func RegisterView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"POST"}){
		return
	}
	user, err := auth.DecodeRequestBodyIntoUser(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return

	}
	if !user.Validate(){
		http.Error(w, "",http.StatusBadRequest)
		return
	}
	if tbr, ok, err := user.CheckIfExists(); ok{
		if err != nil{
			http.Error(w, "", http.StatusInternalServerError)
			return
		}
		http.Error(w, fmt.Sprintf("%s is already in use", tbr), http.StatusFound)
		return
	}
	var hashedPassword string
	hashedPassword, err = auth.HashPassword(user.Password)
	user.Password = hashedPassword
	id, err := user.Save(true)
	if err != nil{
		defer logging.ErrorLogger(err)
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	p := models.Profile{UserID: id}
	go p.Save()
	if tokenPair, err := auth.GenerateTokenPair(id); err == nil{
		w.Write(tokenPair.AuthToken)
		return
	}
	
}

//LoginView is a function to check if user exists and then if the password is correct
func LoginView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"POST"}){
		return
	}
	user, err := auth.DecodeRequestBodyIntoUser(r)
	if err != nil {
		defer logging.ErrorLogger(err)
        http.Error(w, "", http.StatusBadRequest)
        return
	}

	var (
		username string
		password string
		id models.UserID
	)
	stmt ,err := db.DBCon.Prepare("SELECT id, username, password FROM users WHERE username = $1;")
	row := stmt.QueryRow(user.Username)
	err = row.Scan( &id, &username, &password)

	if err != nil{
		fmt.Println(err.Error())
		http.Error(w, fmt.Sprintf("{ %s: %s, }", "error", err.Error()), http.StatusNotFound)
		return
	}
	stmt.Close()
	if auth.ComparePasswords(user.Password, password){
		tokenPair, err := auth.GenerateTokenPair(id)
		if err != nil{
			go logging.ErrorLogger(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		go tokenPair.Refreshtoken.Store(id)
		w.Write(tokenPair.AuthToken)

	}else{
		auth.ReturnUnauthorized(w)
	}
}

//RefreshView is called when an authtoken has expired
func RefreshView(w http.ResponseWriter, r *http.Request, id interface{}){
	if !util.CheckIfMethodAllowed(w, r, []string{"POST"}){
		return
	}
	query := "SELECT refresh_token FROM jwt_auth WHERE user_id=$1 AND refresh_token != NULL"
	var rt interface{}
	fmt.Println(db.DBCon.QueryRow(query, id).Scan(&rt))
	if rt == nil{
		auth.ReturnUnauthorized(w)
		return
	}
	
}

//ChangeUserView is a function to change the users password
func ChangeUserView(w http.ResponseWriter, r *http.Request, id interface{}){
	if !util.CheckIfMethodAllowed(w, r, []string{"PUT"}){
		util.ReturnBadRequest(w)
		return 
	}
	if user, err := auth.DecodeRequestBodyIntoUser(r); err == nil{
		r.Context().Value(user)
		if user.Validate(){
			db.DBCon.QueryRow("UPDATE users SET username=$1, password=$2 WHERE id=$3;", user.Username, user.Email, id)
		}
	}else{
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	
	w.Write([]byte("200"))	
}

//SafeUserResponse is a user instance stripped of the unsafe properties such as password
type SafeUserResponse struct {
		Username string
		Email string
}
//GetUserView gets a user from the db and returns it
func GetUserView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"GET"}){
		util.ReturnBadRequest(w)
		return 
	}
	
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(models.UserID);ok{
		user := models.UserModel{}
		user.ID = derivedID
		err := user.Retrieve()
		if err != nil{
			util.ReturnBadRequest(w)
			return
		}
		res := SafeUserResponse{Username: user.Username, Email: user.Password}
		jsonResponse, err := json.Marshal(res)
		if err !=nil{
			util.ReturnBadRequest(w)
			return
		}
		w.Write(jsonResponse)
	}
}

//DeleteUserView is a function
func DeleteUserView(w http.ResponseWriter, r *http.Request, id interface{}){
	if !util.CheckIfMethodAllowed(w, r, []string{"DELETE"}){
		return
	}
	db.DBCon.QueryRow("DELETE FROM users WHERE id=$1;", id)
}