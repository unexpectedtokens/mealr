package models

import (
	"errors"
	"fmt"

	db "github.com/unexpectedtokens/mealr/database"
)

// UserModel is the model that is to be used for users througout the application
type UserModel struct {
	ID UserID			`json:"id" sql:"id"` 
	Username string 	`json:"username"`
	Email string		`json:"email"`
	Password string		`json:"password"`
}

//UserID is the type to hold userid's
type UserID int64

//Validate validates a users input in the register view
func (u *UserModel) Validate() bool{
	valid := true
	if valid = u.Email != "" && valid; !valid{
		return false
	}
	if valid = u.Username != "" && valid; !valid{
		return false
	}
	if valid = u.Password != "" && valid; !valid{
		return false
	}
	return valid
}


//CheckIfExists checks if a user exists in the database
func(u *UserModel) CheckIfExists() (string, bool, error){
	stmtUsername, err :=db.DBCon.Prepare("SELECT id FROM users WHERE username=$1;")
	stmtEmail, err := db.DBCon.Prepare("SELECT id FROM users WHERE email=$1;")
	if err!=nil{
		return "", true, err
	}
	var idUsername int
	var idEmail int
	stmtUsername.QueryRow(u.Email, u.Username).Scan(&idUsername)
	stmtEmail.QueryRow(u.Email).Scan(&idEmail)
	if idUsername > 0{
		return "username", true, nil
	}
	if idEmail > 0{
		return "email", true, nil
	}
	return "", false, nil
}


//Save is a method to save a user model into the database
func (u *UserModel) Save(newUser bool) (UserID, error){
	var query string
	if !newUser {
		fmt.Println("updating a user")
		if u.ID > 0{
			query = "UPDATE users SET username=$1, password=$2 WHERE id=$3;"
			_, err := db.DBCon.Query(query, u.Username, u.Password, u.ID)
			if err != nil{
				return 0, err
			}
			return u.ID, nil
		}
		return 0, errors.New("id needs to be specified")
	} 
	fmt.Println("Creating a new user")
	query = "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id;"
	var id UserID
	row:= db.DBCon.QueryRow(query, u.Email, u.Username, u.Password)
	row.Scan(&id)
	return id, nil
}