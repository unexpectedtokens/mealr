package calories

import (
	"time"

	"github.com/unexpectedtokens/mealr/models"
)

//BMR is the basal metabolic rate. The amount of calories a person would burn in a day if inactive for that entire day.
type BMR int


type activity struct{
	Level float64
	Description string
}

//ActivityOptions represent the possible forms a persons level of activity can be
var ActivityOptions map[string]activity = map[string]activity{
	"sedentary": {Level: 1.2, Description: "little to no exercise + work a desk job"},
	"light":  {Level: 1.375, Description: "light exercise 1-3 days / week"},
	"moderate": {Level: 1.55, Description: "moderate exercise 3-5 days / week"},
	"very": {Level: 1.725, Description: "heavy exercise 6-7 days / week"},
	"extreme": {Level: 1.9, Description: "very heavy exercise, hard labor job, training 2x / day"},
}

//CalculateTDEE returns a TDEE. This is the total daily energy expenditure
func calculateTDEE(bmr float64, act string) int{
	return int(float64(bmr) * ActivityOptions[act].Level)
}

//CalculateNeededCalories calculates the basal metabolic rate
func CalculateNeededCalories(p models.Profile) (int, error){
	// For men:
	// BMR = 10W + 6.25H - 5A + 5
	// For women:
	// BMR = 10W + 6.25H - 5A - 161
	var age time.Duration
	age = time.Duration(time.Since(p.Dob).Hours()/ (24*365))
	var MSJE float64
	if p.Gender == "male"{
		MSJE = (10*p.Weight) + (6.25*p.Height) - (5*float64(age)) + 5
	}else{
		MSJE = (10*p.Weight + 6.25*p.Height - 5*float64(age) - 161.0)
	}
	
	return int(calculateTDEE(MSJE, "moderate")), nil
}







// Sedentary (little to no exercise + work a desk job) = 1.2
// Lightly Active (light exercise 1-3 days / week) = 1.375
// Moderately Active (moderate exercise 3-5 days / week) = 1.55
// Very Active (heavy exercise 6-7 days / week) = 1.725
// Extremely Active (very heavy exercise, hard labor job, training 2x / day) = 1.9


