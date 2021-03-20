package routes

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"

	"github.com/unexpectedtokens/mealr/calories"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/models"
	"github.com/unexpectedtokens/mealr/util"
)

//

var excludeMutex sync.Mutex
func returnRecipe(estCal int) error{
	//fmt.Println("calories from returnrecipe", calories)
	
	stmt, err := db.DBCon.Prepare(`WITH my_value (var) AS (
	VALUES(500)
	)SELECT id FROM recipes, my_value WHERE cals_provided AND cals_per_serving BETWEEN var - 100 AND var + 100;`);
	if err != nil{
		return err
	}
	var recipe models.Recipe

	err = stmt.QueryRow(estCal).Scan(&recipe)
	if err !=nil{
		return err
	}
	fmt.Println(recipe)
	return nil
}

func generateDayPlan() []models.Recipe{

	return []models.Recipe{}
}

var generateMutex sync.Mutex
//GeneratePlanView is a view that returns a recipe back te the requester
func GeneratePlanView (w http.ResponseWriter, r *http.Request){
	// now := time.Now()
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(models.UserID); ok{
		
		profile := models.Profile{UserID: derivedID}
		
		profile.Retrieve()
		if profile.Validate(){
			mealsQuery, ok := r.URL.Query()["meals"]
			if !ok{
				fmt.Println("Unparseable query")
				util.ReturnBadRequest(w)
				return
			}
			meals, err := strconv.Atoi(mealsQuery[0])
			if err != nil || (meals < 2 || meals > 6){
				fmt.Println(err)
				util.ReturnBadRequest(w)
				return
			}
			var nc int
			nc, err = calories.CalculateNeededCalories(profile)
			if err !=nil{
				fmt.Println(err)
				util.HTTPServerError(w)
				return
			}
			fmt.Println(nc)
			//toExclude := []string{}
			
			
			//today := time.Now()
			
			// for i := 1;i <= 7; i++{
			
			// 	hours := i * 24
			// 	dayTimeStamp := today.Add(time.Hour * time.Duration(hours))
			// 	weekDay := dayTimeStamp.Weekday()
			// 	go func(){
			// 		generateMutex.Lock()
			// 		weekPlan.plan[weekDay.String()] = generateDayPlan(&toExclude, nc, dayTimeStamp, amountOfMeals)
			// 		generateMutex.Unlock()
			// 		wg.Done()
			// 	}()
			// }
			// wg.Wait()
			// mw, err := json.Marshal(weekPlan.plan)
			// if err!=nil{
			// 	panic(err)
			// }
			w.Write([]byte("mw"))
		} else{
			util.ReturnBadRequest(w)
		}
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