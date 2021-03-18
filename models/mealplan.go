package models

import "time"

//DayInPlan is a day in a weeklong mealplan
type DayInPlan struct{
	RecipeID int
	Order int
	DayOfWeek string
	Recipes []AllRecipeData
}

//Mealplan is the response data that is sent back on mealplan generation
type Mealplan struct{
	ID int64
	UserID int64
	CreatedOn time.Time
	Days []DayInPlan
}
