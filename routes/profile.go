package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/calories"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/models"
	"github.com/unexpectedtokens/mealr/util"
)

// UpdateProfileView updates an existing
func UpdateProfileView(w http.ResponseWriter, r *http.Request){
	
	if !util.CheckIfMethodAllowed(w, r, []string{"PUT", "UPDATE"}){
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(models.UserID); ok{
		newProfile := models.Profile{}
		profile := models.Profile{}
		profile.UserID = derivedID
		err := profile.Retrieve()
		if err != nil{
			fmt.Println(err)
			return
		}
		err = json.NewDecoder(r.Body).Decode(&newProfile)
		if err != nil{
			fmt.Println(err)
			util.ReturnBadRequest(w)
			return
		}
		if err = profile.Update(newProfile);err !=nil{
			fmt.Println(err)
			util.ReturnBadRequest(w)
		}
	
	} else {
		auth.ReturnUnauthorized(w)
	}
	
}
//GetProfileView gets a profile based on the id passed in the JWT
func GetProfileView(w http.ResponseWriter, r *http.Request){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(models.UserID);ok{
		profile := models.Profile{UserID: derivedID}
		err := profile.Retrieve()
		if err != nil{
			util.ReturnBadRequest(w)
			return
		}

		res, err := json.Marshal(profile)
		if err !=nil{
			util.ReturnBadRequest(w)
			return
		}
		w.Write(res)
	}
}


//ActivityOptionsView returns the levels in activity
func ActivityOptionsView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"GET"}){
		return
	}
	response, err := json.Marshal(calories.ActivityOptions)
	if err != nil{
		util.ReturnBadRequest(w)
		return
	}
	w.Write(response)
}

type validProfileResponse struct {
	Valid bool
}
//ProfileValidForMealPlanGeneratorView checks if the profile in question is valid for mealplan generation. If not the frontend can act accordingly
func ProfileValidForMealPlanGeneratorView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"GET"}){
		util.ReturnBadRequest(w)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(models.UserID);ok{
		profile := models.Profile{}
		profile.UserID = derivedID
		profile.Retrieve()
		res := validProfileResponse{
			Valid: true,
		}
		if !profile.Validate(){
			res.Valid = false
		}
		jsonResponse, err := json.Marshal(res)
		if err !=nil{
			util.ReturnBadRequest(w)
			return
		}
		w.Write(jsonResponse)
	}
}