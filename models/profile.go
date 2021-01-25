package models

import db "github.com/unexpectedtokens/mealr/database"

//Profile is the struct that represents a users profile
type Profile struct {
	ID int64
	Age int
	Height float64
	Weight float64
	WeightGoal float64
	UserID int64
	Gender string
}


//CreateProfile is a function to create a profile
func CreateProfile(userID int64) {
	if userID != 0{
		_, err := db.DBCon.Query("INSERT INTO profiles (user_id) VALUES ($1);", userID)
		if err!=nil{
			panic(err)
		}
	}
}