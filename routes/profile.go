package routes

import (
	"fmt"
)

// UpdateProfileView updates an existing
func UpdateProfileView(){
	allowedToUpdate := []string{"age"}
	profile := map[string]interface{}{}
	fmt.Println(allowedToUpdate, profile)
}