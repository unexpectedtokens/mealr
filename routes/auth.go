package routes

import (
	"net/http"

	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/helpers"
	"github.com/unexpectedtokens/mealr/logging"
)
var signingkey = []byte("XinthiaBestBab3Ever")




// RegisterView is a function to register a user
func RegisterView(w http.ResponseWriter, r *http.Request){
	user, err := helpers.DecodeRequestBodyIntoUser(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if !user.Validate(){
		http.Error(w, "",http.StatusBadRequest)
		return
	}
	var hashedPassword string
	hashedPassword, err = helpers.HashPassword(user.Password)
	user.Password = hashedPassword
	id, err := user.Save(true)
	if err != nil{
		defer logging.ErrorLogger(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if payload, err := helpers.GenerateToken(id); err == nil{
		w.Write(payload)
	}
	
}

//LoginView is a function to check if user exists and then if the password is correct
func LoginView(w http.ResponseWriter, r *http.Request){
	user, err := helpers.DecodeRequestBodyIntoUser(r)
	if err != nil {
		defer logging.ErrorLogger(err)
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
	}
	var (
		username string
		password string
		id int64
	)
	err = db.DBCon.QueryRow("SELECT id, username, password FROM users WHERE username = $1 OR email = $2;", user.Username, user.Email).Scan( &id, &username, &password)
	if err != nil{
		http.Error(w, err.Error(), http.StatusNotFound)
	}
	if helpers.ComparePasswords(user.Password, password){
		var token []byte
		token, err = helpers.GenerateToken(id)
		if err != nil{
			logging.ErrorLogger(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Write([]byte(token))
	}else{
		w.WriteHeader(http.StatusUnauthorized)
	}
}


func RefreshView(w http.ResponseWriter, r *http.Request){


	
}

//ChangeUserView is a function to change the users password
func ChangeUserView(w http.ResponseWriter, r *http.Request, id interface{}){
	if user, err := helpers.DecodeRequestBodyIntoUser(r); err == nil{
		r.Context().Value(user)
		db.DBCon.QueryRow("UPDATE users SET username=$1, password=$2 WHERE id=$3;", user.Username, user.Email, id)
	}else{
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	
	w.Write([]byte("200"))	
}



//DeleteUserView is a function
func DeleteUserView(w http.ResponseWriter, r *http.Request, id interface{}){
	db.DBCon.QueryRow("DELETE FROM users WHERE id=$1;", id)
}