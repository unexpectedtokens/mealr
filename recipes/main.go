package recipes

import (
	"database/sql"
	"time"

	"github.com/unexpectedtokens/mealr/auth"
)

type Ingredient struct {
	ID          int64
	Measurement string
	Amount      float64
	Title       string
}

type RecipeIngredientFromFoodIngredient struct {
	ID               int64
	Amount           float64
	FoodIngredientID int64
	FoodIngredient
}

type FoodIngredient struct {
	ID          int64
	Name        string
	CalsPer100  int
	ServingUnit string
}

type MethodStep struct {
	ID int64
	ActionAfterTimer,
	StepDescription string
	DurationInMinutes float32
	TimeStampAdded    time.Time
	StepNumber        int
	TimerDuration     float32
	Timer             bool
}

//Recipe is a representation of a recipe in the database. It is used in the scraper and in the auth routes
type Recipe struct {
	ID      int64
	OwnerID auth.UserID
	Owner   auth.UserModel
	Title,
	// Source,
	// SourceURL,
	ImageURL string
	//Description string
	Serves         int
	ServingSize    string
	CalsProvided   bool
	CalsPerServing int
	// Vegetarian bool
	// Vegan bool
	//TypeOfMeal string
	LikeByUser bool
	Likes      int
	//Public bool
}

type RecipeFoodIngredientList []RecipeIngredientFromFoodIngredient
type IngredientsMisc []Ingredient
type MethodFromRecipe []string

//AllRecipeData if the form in which the recipe list is represented
type AllRecipeData struct {
	ID       int64
	Title    string
	Source   string
	ImageURL string
}

//IsValidForDBInsertion checks if a scraped recipe is populated enough to be added to the db
func (c *Recipe) IsValidForDBInsertion() (valid bool) {
	valid = true
	valid = c.Title != ""
	return valid
}

//DayInPlan is a day in a weeklong mealplan
type DayInPlan struct {
	Order     int
	DayOfWeek string
	Recipes   []AllRecipeData
}

//Mealplan is the response data that is sent back on mealplan generation
type Mealplan struct {
	ID        int64
	UserID    auth.UserID
	CreatedOn time.Time
	Days      []DayInPlan
}

func CalcPercentage(part, whole int) (percentageNotCalculated float32) {
	percentageNotCalculated = float32(part) / float32(whole) * 100.0
	return
}

func GetInstructionsCount(db *sql.DB, id int64) (count int, err error) {
	err = db.QueryRow("SELECT COUNT(id) FROM methods_from_recipe WHERE recipeid = $1;", id).Scan(&count)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, err
	}
	return count, nil
}

// func CalculateCaloriesFromRecipe(fi RecipeFoodIngredientList) (amountOfCalories int){

// 	for _, x := range fi{
// 		amountOfCaloriesFloat := x.Amount / 100.0 * float64(x.CalsPer100)
// 		amountOfCalories += int(amountOfCaloriesFloat)
// 	}
// 	return
// }
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
