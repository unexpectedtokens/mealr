package routes

import (
	"fmt"
	"net/http"

	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/models"
	"github.com/unexpectedtokens/mealr/util"
)
var signingkey = []byte("XinthiaBestBab3Ever")




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
	var hashedPassword string
	hashedPassword, err = auth.HashPassword(user.Password)
	user.Password = hashedPassword
	id, err := user.Save(true)
	if err != nil{
		defer logging.ErrorLogger(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if tokenPair, err := auth.GenerateTokenPair(id); err == nil{
		w.Write(tokenPair.AuthToken)
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
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
	}
	var (
		username string
		password string
		id models.UserID
	)
	err = db.DBCon.QueryRow("SELECT id, username, password FROM users WHERE username = $1 OR email = $2;", user.Username, user.Email).Scan( &id, &username, &password)
	if err != nil{
		http.Error(w, err.Error(), http.StatusNotFound)
	}
	if auth.ComparePasswords(user.Password, password){
		tokenPair, err := auth.GenerateTokenPair(id)
		if err != nil{
			logging.ErrorLogger(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		go tokenPair.Refreshtoken.Store(id)
		w.Write(tokenPair.AuthToken)

	}else{
		w.WriteHeader(http.StatusUnauthorized)
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
		http.Error(w, "", http.StatusUnauthorized)
		return
	}
	
}

//ChangeUserView is a function to change the users password
func ChangeUserView(w http.ResponseWriter, r *http.Request, id interface{}){
	if !util.CheckIfMethodAllowed(w, r, []string{"PUT"}){
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



//DeleteUserView is a function
func DeleteUserView(w http.ResponseWriter, r *http.Request, id interface{}){
	if !util.CheckIfMethodAllowed(w, r, []string{"DELETE"}){
		return
	}
	db.DBCon.QueryRow("DELETE FROM users WHERE id=$1;", id)
}