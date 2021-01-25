package routes

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

//Recipes is a slice to hold recipes
type Recipes []Recipe


//WeekPlan is the blueprint for the json string to be sent to the user on week plan request.
type WeekPlan map[string]DayPlan
// type Day struct {
// 	breakfast Recipe 

// }

//DayPlan is to be a part of the weekplan
type DayPlan struct{
	Breakfast Recipe
	Lunch Recipe
	Dinner Recipe
	Snacks []Recipe
}

 
//Ingredient is part of a recipe
type Ingredient struct{
	Text string `json:"text"`
	Weight float64 	`json:"weight"`
	Image string `json:"image"`
}


//Recipe is part of a mealplan
type Recipe struct{
	Ingredients []Ingredient `json:"ingredients"`
	IngredientLines []string `json:"ingredientLines"`
	Yield float64			 `json:"yield"`
	Label string
	Calories float64
	HealthLabels []string	
	TypeOf string
}



//Hit is one item in the response object that is returned from the get request to edamam
type Hit struct{
	Recipe Recipe		`json:"recipe"`
	Bookmarked bool 	`json:"bookmarked"`
	Bought bool			`json:"bought"`
}

//Response is the response object that is returned from edamam
type Response struct{
	Q string
	From int
	To int
	More bool
	Count int
	Hits []Hit
}

func (r Response) String() string{
	return r.Q
}



var qs []string = []string{"Breakfast", "Lunch", "Dinner", "Snack"}
var recipes Recipes

//PopulateRecipes gets recipes from the api and stores them in memory for use of the api
func PopulateRecipes(ex bool) {
	defer recover()
	if ex{
		file, err := ioutil.ReadFile("recipes.json")
		if err !=nil{
		panic(err)
		}
		json.Unmarshal(file, &recipes)
	} else{
		var HTTPGetter = &http.Client{
			Timeout: time.Second * 10,
		}
		for _,x := range qs{
//			fmt.Println(x)
//		fmt.Printf("https://api.edamam.com/search?q=%s&app_id=38a726b5&app_key=a3a08b57d316dbf069c28a3366f881ca&health=vegan&health=vegetarian&mealType=%s\n", x, x)
		resp, err := HTTPGetter.Get(fmt.Sprintf("https://api.edamam.com/search?q=%s&from=0&to=30&app_id=38a726b5&app_key=a3a08b57d316dbf069c28a3366f881ca&health=vegan&health=vegetarian", x))
		if err != nil {
			fmt.Println(err)
			panic(err)
		}
		// fmt.Println(resp.Body)
		var response Response
		if err = json.NewDecoder(resp.Body).Decode(&response); err!=nil{
			fmt.Println(err)
			panic(err)
		}

		for _, f := range response.Hits{
			f.Recipe.TypeOf = x
			recipes = append(recipes, f.Recipe)
		}
	}
	fileData, err := json.MarshalIndent(recipes, "", "")
	if err != nil{
		panic(err)
	}
	_ = ioutil.WriteFile("recipes.json", fileData, 0644)
	// query := "INSERT INTO recipes (label, yield) VALUES "
	// values := []interface{}{}

	// for _, x := range recipes{
	// 	// values = append(values, x.Label, x.Yield)
	// 	// numFields := 2 // the number of fields you are inserting
    // 	// n := i * numFields

    // 	// query += `(`
    // 	// for j := 0; j < numFields; j++ {
    //     // 	query += `$`+strconv.Itoa(n+j+1) + `,`
	// 	// }
	// 	// query = query[:len(query)-1] + `),`
	// 		fmt.Println(x.Calories,x.Label, x.Yield)
	// 	// query += "(" + x.Label + ", " + fmt.Sprintf("%f", x.Yield) + "),"
		
	// }
	// query = query[:len(query)-1] + ";"
	// fmt.Println(query)
	// _, err := db.DBCon.Query(query, values...)
	// if err != nil {
	// 	panic(err)
	// }
	

	

	// a, ok := a["hits"].(Hits)
	// if ok{
	// 	fmt.Println(a)
	// } else{
	// 	fmt.Println("not ok")
	// }
	// // for i,x := range a{
	// // 	if i == "hits"{
	// // 		if potHit, ok := x.(Hit); ok{
	// // 			fmt.Println(potHit)
	// // 		}
	// // 	}
	// // }
	// fmt.Println(hits)
	}
}

func returnRecipe(exclude *[]string, typeOf string, calories float64)Recipe{
	var recipe Recipe
 	for _, x:=range recipes{
		if x.TypeOf == typeOf && !(recipe.Calories > calories + 200 || recipe.Calories < calories - 200){
			unique := true
			for _, i:= range *exclude{
				unique = i != x.Label && unique
				if !unique{
					break
				}
			}
			if unique{
				recipe = x
				break
			}
		}
	
	}
	recipe.Calories = recipe.Calories / recipe.Yield
	fmt.Println(recipe.Calories)
	// if recipe.Calories > calories + 200 || recipe.Calories < calories - 200{
	// 	return returnRecipe(exclude, typeOf, calories)

	// }
	*exclude = append(*exclude, recipe.Label)
	return recipe	
}

func generateDayPlan(exclude *[]string, calories float64) DayPlan{
	var dayPlan DayPlan
	dayPlan.Breakfast = returnRecipe(exclude, "Breakfast", calories / 3)
	dayPlan.Lunch = returnRecipe(exclude, "Lunch", calories / 3)
	dayPlan.Dinner = returnRecipe(exclude, "Dinner", calories / 3)
	fmt.Println("Total daily calories", dayPlan.Breakfast.Calories + dayPlan.Lunch.Calories + dayPlan.Dinner.Calories)
	return dayPlan
}


//GeneratePlanView is a view that returns a recipe back te the requester
func GeneratePlanView (w http.ResponseWriter, r *http.Request){
	var calories float64
	err:=json.NewDecoder(r.Body).Decode(&calories)
	toExclude := []string{}
	weekPlan := make(WeekPlan)
	today := time.Now()
	for i := 1;i <= 7; i++{
		hours := i * 24
		dayTimeStamp := today.Add(time.Hour * time.Duration(hours))
		weekDay := dayTimeStamp.Weekday()
		weekPlan[weekDay.String()] = generateDayPlan(&toExclude, calories)
	}
	mw , err := json.Marshal(weekPlan)
	if err!=nil{
		panic(err)
	}
	w.Write([]byte(mw))
}