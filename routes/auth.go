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
	"github.com/unexpectedtokens/mealr/profiles"
	"github.com/unexpectedtokens/mealr/tokens"
	"github.com/unexpectedtokens/mealr/util"
)

type JWTPayload struct{
	Key tokens.AuthToken
}

func generateJWTPayload(token tokens.AuthToken) ([]byte, error){
	pl := JWTPayload{
		Key: token,
	}
	plByteString, err := json.Marshal(pl)
	if err != nil {
		return []byte{}, err
	}
	return plByteString, nil
}

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
			util.HTTPServerError(w)
			return
		}
		http.Error(w, fmt.Sprintf("%s is already in use", tbr), http.StatusFound)
		return
	}
	var hashedPassword string
	hashedPassword, err = auth.HashPassword(user.Password)
	if err != nil{
		defer logging.ErrorLogger(fmt.Errorf("something went wrong generating password hash: %s", err.Error()),"routes/auth.go", "RegisterView")
	}
	user.Password = hashedPassword
	id, err := user.Save(true)
	if err != nil{
		defer logging.ErrorLogger(err, "routes/auth.go", "RegisterView")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	p := profiles.Profile{UserID: id}
	go p.Save()
	if token, err := tokens.GenerateToken(id); err == nil{
		go token.Store(id)
		res, err := generateJWTPayload(token)
		if err != nil{
			defer logging.ErrorLogger(err, "routes/auth.go", "RegisterView")
			util.HTTPServerError(w)
			return
		}
		w.Write(res)
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
		defer logging.ErrorLogger(err, "routes/auth.go", "LoginView")
        http.Error(w, "", http.StatusBadRequest)
        return
	}

	var (
		username string
		password string
		id auth.UserID
	)
	stmt ,err := db.DBCon.Prepare("SELECT id, username, password FROM users WHERE username = $1;")
	if err != nil{
		defer logging.ErrorLogger(fmt.Errorf("something went wrong generating select query: %s", err.Error()), "routes/auth.go", "LoginView")
	}
	row := stmt.QueryRow(user.Username)
	err = row.Scan( &id, &username, &password)

	if err != nil{
		fmt.Println(err.Error())
		http.Error(w, fmt.Sprintf("{ %s: %s, }", "error", err.Error()), http.StatusNotFound)
		return
	}
	stmt.Close()
	if auth.ComparePasswords(user.Password, password){
		token, err := tokens.GenerateToken(id)
		if err != nil{
			go logging.ErrorLogger(err, "routes/auth.go", "LoginView")
			util.HTTPServerError(w)
			return
		}
		err = token.Store(id)
		if err != nil{
			go logging.ErrorLogger(err, "routes/auth.go", "LoginView")
			util.HTTPServerError(w)
			return
		}
		res, err := generateJWTPayload(token)
		if err!=nil{
			go logging.ErrorLogger(err, "routes/auth.go", "LoginView")
			util.HTTPServerError(w)
			return
		}
		w.Write(res)

	}else{
		auth.ReturnUnauthorized(w)
	}
}

//RefreshView is called when an authtoken has expired
func RefreshView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"POST"}){
		return
	}
	if len(r.Header["Authorization"]) == 0 {
		auth.ReturnUnauthorized(w)
		return
	}	
	token := r.Header["Authorization"][0]
	tokenString := string(token)
	fmt.Println(tokenString)	
	rt, err:=tokens.GetToken(tokens.AuthToken(token))
	if err != nil{
		defer logging.ErrorLogger(fmt.Errorf("something went wrong getting refreshtoken from db: %s", err.Error()), "routes/auth.go", "RefreshView")
		auth.ReturnUnauthorized(w)
		return
	}
	if rt.CheckValidForRefresh(){
		//fmt.Println("parsed id from token", rt.UserID)
		newToken, err := tokens.GenerateToken(rt.UserID)
		if err != nil{
			defer logging.ErrorLogger(fmt.Errorf("something went wrong generating a new token: %s", err.Error()), "routes/auth.go", "RefreshView")
			util.ReturnBadRequest(w)
			return
		}
		rt.Token = newToken
		rt.Refresh()
		tokenPayload, err := generateJWTPayload(newToken)
		if err != nil{
			fmt.Println(fmt.Errorf("error generating token payload: %s", err.Error()))
			util.HTTPServerError(w)
			return
		}
		w.Write(tokenPayload)
	}else{
		auth.ReturnUnauthorized(w)
		rt.Delete()
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
	
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID);ok{
		fmt.Println(derivedID)
		if derivedID == 0{
			util.ReturnBadRequest(w)
			return
		}
		user := auth.UserModel{}
		user.ID = derivedID
		err := user.Retrieve()
		if err != nil{
			fmt.Println(err)
			util.ReturnBadRequest(w)
			return
		}
		res := SafeUserResponse{Username: user.Username, Email: user.Password}
		jsonResponse, err := json.Marshal(res)
		if err !=nil{
			fmt.Println(err)
			util.ReturnBadRequest(w)
			return
		}
		w.Write(jsonResponse)
	}
}

//DeleteUserView is a function
// func DeleteUserView(w http.ResponseWriter, r *http.Request, id interface{}){
// 	if !util.CheckIfMethodAllowed(w, r, []string{"DELETE"}){
// 		return
// 	}
// 	db.DBCon.QueryRow("DELETE FROM users WHERE id=$1;", id)
// }


func LogOutView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"POST"}){
		return
	}
	if len(r.Header["Authorization"]) == 0 {
		auth.ReturnUnauthorized(w)
		return
	}	
	token := tokens.AuthToken(r.Header["Authorization"][0])
	rt:=tokens.RefreshToken{Token: token}
	err := rt.Delete()
	if err != nil{
		logging.ErrorLogger(err, "routes/auth.go", "LogOutView")
		return
	}
	tokens.AddToTokenBlacklist(token)
	w.WriteHeader(http.StatusOK)
}