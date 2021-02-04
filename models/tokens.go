package models

import (
	db "github.com/unexpectedtokens/mealr/database"
)

//AuthToken is returned to the user that is trying to log in
type AuthToken string




//RefreshToken is stored in the database and is checked when
type RefreshToken struct{
	Token string
}

// Store stores a refreshtoken in the database
func (r *RefreshToken) Store(id UserID) error{
	query := "SELECT refresh_token FROM jwt_auth WHERE user_id=$1"
	var token interface{}
	db.DBCon.QueryRow(query, id).Scan(&token)
	if token == nil{

		query = "INSERT INTO jwt_auth (user_id, refresh_token) VALUES ($1, $2);"
		row := db.DBCon.QueryRow(query, id, r.Token)
		var answer interface{}
		row.Scan(&answer)
		return nil
	}
	query = "UPDATE jwt_auth SET refresh_token = $1 WHERE user_id=$2;"
	var answer interface{}
	db.DBCon.QueryRow(query, r.Token, id).Scan(&answer)
	return nil
}



