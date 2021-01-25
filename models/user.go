package models

import (
	"errors"
	"fmt"

	db "github.com/unexpectedtokens/mealr/database"
)

// UserModel is the model that is to be used for users througout the application
type UserModel struct {
	ID int64				`json:"id" sql:"id"` 
	Username string 	`json:"username"`
	Email string		`json:"email"`
	NewPassword string	`json:"newpassword"`
	Password string		`json:"password"`
}


func (u *UserModel) Validate() bool{
	valid := true
	valid = u.Email != "" && valid
	valid = u.Username != "" && valid
	valid = u.Password != "" && valid
	return valid
}

// Represent is a method to represent a user with a formatted string
func (u *UserModel) Represent()  string{
	return fmt.Sprintf("Username: %s, email: %s", string(u.Username), string(u.Email)) 
}

//Save is a method to save a user model into the database
func (u *UserModel) Save(newUser bool) (int64, error){
	var query string
	if !newUser {
		if u.ID > 0{
			query = "UPDATE users SET username=$1, password=$2 WHERE id=$3;"
			_, err := db.DBCon.Query(query, u.Username, u.Password, u.ID)
			if err != nil{
				return 0, err
			}
			return u.ID, nil
		}else{
			return 0, errors.New("id needs to be specified")
		}
	} else{
		query = "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id;"
		var id int64
		row:= db.DBCon.QueryRow(query, u.Email, u.Username, u.Password)
		row.Scan(&id)
		return id, nil
	}
}