package models

import (
	"errors"

	db "github.com/unexpectedtokens/mealr/database"
)

// UserModel is the model that is to be used for users througout the application
type UserModel struct {
	ID UserID				`json:"id" sql:"id"` 
	Username string 	`json:"username"`
	Email string		`json:"email"`
	NewPassword string	`json:"newpassword"`
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


//Save is a method to save a user model into the database
func (u *UserModel) Save(newUser bool) (UserID, error){
	var query string
	if !newUser {
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
	query = "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id;"
	var id UserID
	row:= db.DBCon.QueryRow(query, u.Email, u.Username, u.Password)
	row.Scan(&id)
	return id, nil
}