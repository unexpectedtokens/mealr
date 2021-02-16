package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/models"
)

// UpdateProfileView updates an existing
func UpdateProfileView(w http.ResponseWriter, r *http.Request){
	if derivedID, ok := r.Context().Value(w).(models.UserID); ok{
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
			fmt.Println("decoding error: ",err)
			auth.ReturnBadRequest(w)
			return
		}
		fmt.Println(newProfile.Dob.Format(models.LayoutUS))
		if err = profile.Update(newProfile);err !=nil{
			fmt.Println(err)
			auth.ReturnBadRequest(w)
		}
	
	} else {
		auth.ReturnUnauthorized(w)
	}
	
}