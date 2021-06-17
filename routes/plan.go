package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/calories"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/profiles"
	"github.com/unexpectedtokens/mealr/recipes"
	"github.com/unexpectedtokens/mealr/util"
)

//

var caloricMismatchAllowed = 350


func saveMPToDB(mp recipes.Mealplan) error{
	db.DBCon.Prepare("INSERT INTO")


	return nil
}

type dayInPlanWithError struct {
	Day recipes.DayInPlan
	Err error
}

var placeHolderPlan recipes.Mealplan

var excludeMutex sync.Mutex

func returnRecipes(estCal int, toExclude *[]int64) (allRecipeResponseList, error){
	
	var excludePartial string
	values := []interface{}{}
	excludeMutex.Lock()
	if len(*toExclude) > 0{
		fmt.Println("implementing to exclude func", toExclude)
		excludePartial += " AND id NOT IN ("	
		for i, x := range *toExclude{
			values = append(values, x)
			excludePartial += fmt.Sprintf("$%d,", i + 1)
		}
		excludePartial = excludePartial[0:len(excludePartial)-1] + ")"
	}
	excludeMutex.Unlock()
	
	queryString := fmt.Sprintf("WITH my_value (var1, var2) AS (VALUES(%d, %d)) SELECT id, title, source, image_url FROM recipes, my_value WHERE cals_provided AND cals_per_serving BETWEEN var1 - var2 AND var1 + var2%s;", estCal, caloricMismatchAllowed, excludePartial)
	fmt.Println(queryString)
	stmt, err := db.DBCon.Prepare(queryString);
	if err != nil{
		fmt.Println("query error", err)
		return allRecipeResponseList{}, err
	}
	

	rows, err := stmt.Query(values...)
	//.Scan(&recipe.ID, &recipe.Title, &recipe.Source, &recipe.ImageURL)
	if err !=nil{
		return allRecipeResponseList{}, err
	}
	defer rows.Close()
	recipesList := allRecipeResponseList{}
	for rows.Next(){
		var recipe recipes.AllRecipeData
		rows.Scan(&recipe.ID, &recipe.Title, &recipe.Source, &recipe.ImageURL)
		recipesList = append(recipesList, recipe)
	}
	excludeMutex.Lock()
	for _, x:=range recipesList{
		*toExclude = append(*toExclude, x.ID)
	}
	excludeMutex.Unlock()
	return recipesList, nil
}


func generateDayPlan(nc, meals, order int, toExclude *[]int64, weekDay string, dayPlanChan chan dayInPlanWithError) {
	retVal := dayInPlanWithError{}
	dayPlan := recipes.DayInPlan{Order: order, DayOfWeek: weekDay}
	recipesList, err := returnRecipes(nc / meals, toExclude)
	if err !=nil{
		retVal.Err = err
		fmt.Println(err)
		dayPlanChan <- retVal
		return
	}
	dayPlan.Recipes = recipesList
	retVal.Day = dayPlan
	fmt.Println("to Excldude on day", order, ": ", *toExclude)
	dayPlanChan <- retVal
}



var generateMutex sync.Mutex
//GeneratePlanView is a view that returns a recipe back te the requester
func GeneratePlanView (w http.ResponseWriter, r *http.Request){
	placeHolderPlan = recipes.Mealplan{}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		profile := profiles.Profile{UserID: derivedID}
		profile.Retrieve()
		if profile.Validate(){
			mealsQuery, ok := r.URL.Query()["meals"]
			if !ok{
				fmt.Println("Unparseable query")
				util.ReturnBadRequest(w)
				return
			}
			meals, err := strconv.Atoi(mealsQuery[0])
			if err != nil || (meals < 2 || meals > 3){
				fmt.Println(err)
				util.ReturnBadRequest(w)
				return
			}
			var nc int
			nc, err = calories.CalculateNeededCalories(profile)
			if err !=nil{
				logging.ErrorLogger(err, "routes/plan.go", "GeneratePlanView")
				util.HTTPServerError(w)
				return
			}
			toExclude := []int64{}
			today := time.Now()
			mealplan := recipes.Mealplan{CreatedOn: today, UserID: derivedID}
			DayInPlanChan := make(chan dayInPlanWithError, 7)
			for i := 1;i <= 7; i++{
				hours := i * 24
				dayTimeStamp := today.Add(time.Hour * time.Duration(hours))
				weekDay := dayTimeStamp.Weekday()
				go generateDayPlan(nc, meals, i, &toExclude ,weekDay.String(), DayInPlanChan)
			}
			days := []recipes.DayInPlan{}
			for i := 1; i <= 7;i++{
				var dayInPlan dayInPlanWithError
				dayInPlan =  <- DayInPlanChan
				if dayInPlan.Err == nil {
					days = append(days, dayInPlan.Day)
				}
			}
			mealplan.Days = days
			placeHolderPlan = mealplan
			w.WriteHeader(200)
		}else{
			util.ReturnBadRequest(w)
		}
	}
}
//PlanGet checks if a mealplan exists or calls createPlan if one doesn't
func PlanGet(w http.ResponseWriter, r *http.Request){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		fmt.Println("derivedID", derivedID)
		mmp, err := json.Marshal(placeHolderPlan)
		if err !=nil{
			util.HTTPServerError(w)
			return
		}
		w.Write(mmp)
	}else{
		util.ReturnBadRequest(w)
	}
	
	
	
}

//PopulateRecipes gets recipes from the api and stores them in memory for use of the api
// func PopulateRecipes(ex bool) {
// 	// defer recover()
// 	if ex{
// 		file, err := ioutil.ReadFile("recipes.json")
// 		if err !=nil{
// 		panic(err)
// 		}
// 		json.Unmarshal(file, &recipesList)
// 	} else{
// 		var HTTPGetter = &http.Client{
// 			Timeout: time.Second * 10,
// 		}
// 		for _,x := range qs{
// //		fmt.Println(x)
// //		fmt.Printf("https://api.edamam.com/search?q=%s&app_id=38a726b5&app_key=a3a08b57d316dbf069c28a3366f881ca&health=vegan&health=vegetarian&mealType=%s\n", x, x)
// 		resp, err := HTTPGetter.Get(fmt.Sprintf("https://api.edamam.com/search?q=%s&from=0&to=30&app_id=38a726b5&app_key=a3a08b57d316dbf069c28a3366f881ca&health=vegan&health=vegetarian", x))
// 		if err != nil {
// 			fmt.Println(err)
// 			panic(err)
// 		}
// 		// fmt.Println(resp.Body)
// 		var response Response
// 		if err = json.NewDecoder(resp.Body).Decode(&response); err!=nil{
// 			fmt.Println(err)
// 			panic(err)
// 		}

// 		for _, f := range response.Hits{
// 			f.Recipe.TypeOf = x
// 			recipesList = append(recipesList, f.Recipe)
// 		}
// 	}
// 	fileData, err := json.MarshalIndent(recipesList, "", "")
// 	if err != nil{
// 		panic(err)
// 	}
// 	_ = ioutil.WriteFile("recipes.json", fileData, 0644)
// 	// query := "INSERT INTO recipes (label, yield) VALUES "
// 	// values := []interface{}{}

// 	// for _, x := range recipes{
// 	// 	// values = append(values, x.Label, x.Yield)
// 	// 	// numFields := 2 // the number of fields you are inserting
//     // 	// n := i * numFields

//     // 	// query += `(`
//     // 	// for j := 0; j < numFields; j++ {
//     //     // 	query += `$`+strconv.Itoa(n+j+1) + `,`
// 	// 	// }
// 	// 	// query = query[:len(query)-1] + `),`
// 	// 		fmt.Println(x.Calories,x.Label, x.Yield)
// 	// 	// query += "(" + x.Label + ", " + fmt.Sprintf("%f", x.Yield) + "),"
		
// 	// }
// 	// query = query[:len(query)-1] + ";"
// 	// fmt.Println(query)
// 	// _, err := db.DBCon.Query(query, values...)
// 	// if err != nil {
// 	// 	panic(err)
// 	// }
	

	

// 	// a, ok := a["hits"].(Hits)
// 	// if ok{
// 	// 	fmt.Println(a)
// 	// } else{
// 	// 	fmt.Println("not ok")
// 	// }
// 	// // for i,x := range a{
// 	// // 	if i == "hits"{
// 	// // 		if potHit, ok := x.(Hit); ok{
// 	// // 			fmt.Println(potHit)
// 	// // 		}
// 	// // 	}
// 	// // }
// 	// fmt.Println(hits)
// 	}
// }