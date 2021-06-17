package recipes

import (
	"time"

	"github.com/unexpectedtokens/mealr/auth"
)

type Ingredient struct{
	Measurement string
	Amount float64
	Title string
}

type RecipeIngredientFromFoodIngredient struct{
	ID int64
	Amount float64
	FoodIngredientID int64
	FoodIngredient
}

type FoodIngredient struct{
	ID int64
	Name string
	CalsPer100 int
	ServingUnit string
}

//Recipe is a representation of a recipe in the database. It is used in the scraper and in the auth routes
type Recipe struct{
	ID int64
	OwnerID auth.UserID
	Owner auth.UserModel
	Title,
	Source,
	SourceURL,
	ImageURL,
	Description string
	
	PrepTime string
	CookingTime string
	Serves int
	ServingSize string
	CalsProvided bool
	CalsPerServing int
	Vegetarian bool
	Vegan bool
	TypeOfMeal string
}

type RecipeFoodIngredientList []RecipeIngredientFromFoodIngredient
type IngredientsMisc []Ingredient
type MethodFromRecipe []string


//AllRecipeData if the form in which the recipe list is represented
type AllRecipeData struct{
	ID int64
	Title string
	Source string
	ImageURL string
	Username string
	Vegan bool
	Vegetarian bool
}

//IsValidForDBInsertion checks if a scraped recipe is populated enough to be added to the db
func (c *Recipe) IsValidForDBInsertion() (valid bool) {
	valid = true
	valid = c.Title != ""
	return valid
}



//DayInPlan is a day in a weeklong mealplan
type DayInPlan struct{
	Order int
	DayOfWeek string
	Recipes []AllRecipeData
}

//Mealplan is the response data that is sent back on mealplan generation
type Mealplan struct{
	ID int64
	UserID auth.UserID
	CreatedOn time.Time
	Days []DayInPlan
}


//bulkinsert recipe ingredients snippet
// func BulkInsert(unsavedRows []*ExampleRowStruct) error {
//     valueStrings := make([]string, 0, len(unsavedRows))
//     valueArgs := make([]interface{}, 0, len(unsavedRows) * 3)
//     i := 0
//     for _, post := range unsavedRows {
//         valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d, $%d)", i*3+1, i*3+2, i*3+3))
//         valueArgs = append(valueArgs, post.Column1)
//         valueArgs = append(valueArgs, post.Column2)
//         valueArgs = append(valueArgs, post.Column3)
//         i++
//     }
//     stmt := fmt.Sprintf("INSERT INTO my_sample_table (column1, column2, column3) VALUES %s", strings.Join(valueStrings, ","))
//     _, err := db.Exec(stmt, valueArgs...)
//     return err
// }