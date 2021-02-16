package routes

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"
)

//recipes is a slice to hold recipes
type recipes []Recipe


//weekPlan is the blueprint for the json string to be sent to the user on week plan request.
type weekPlan struct{
	plan map[string]DayPlan
	keys []string
}

//set is a method to keep track of the order in which the plan needs to be represented. 
//This is because maps dont keep track of insertion order.
func (w *weekPlan) set(key string, item DayPlan){
	w.plan[key] = item
	w.keys = append(w.keys, key)
}

//init initializes the properties on a weekplan
func (w *weekPlan) init(){
	w.keys = []string{}
	w.plan = map[string]DayPlan{}
}


//DayPlan is to be a part of the weekplan
type DayPlan struct{
	Breakfast Recipe
	Lunch Recipe
	Dinner Recipe
	Snacks []Recipe
	day time.Time
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
var recipesList recipes

//PopulateRecipes gets recipes from the api and stores them in memory for use of the api
func PopulateRecipes(ex bool) {
	// defer recover()
	if ex{
		file, err := ioutil.ReadFile("recipes.json")
		if err !=nil{
		panic(err)
		}
		json.Unmarshal(file, &recipesList)
	} else{
		var HTTPGetter = &http.Client{
			Timeout: time.Second * 10,
		}
		for _,x := range qs{
//		fmt.Println(x)
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
			recipesList = append(recipesList, f.Recipe)
		}
	}
	fileData, err := json.MarshalIndent(recipesList, "", "")
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

var excludeMutex sync.Mutex
func returnRecipe(exclude *[]string, typeOf string, calories float64, c chan Recipe){
	//fmt.Println("calories from returnrecipe", calories)
	var recipe Recipe
 	for _, x:=range recipesList{
		if x.TypeOf == typeOf{// && !(recipe.Calories > calories + 200.0 || recipe.Calories < calories - 200.0){
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
	//fmt.Println("recipe.calories: ",recipe.Label)
	if recipe.Label == ""{
		returnRecipe(exclude, typeOf, calories, c)
		return
	}
	recipe.Yield = 1
	excludeMutex.Lock()
	*exclude = append(*exclude, recipe.Label)
	excludeMutex.Unlock()
	c <- recipe
}

func generateDayPlan(exclude *[]string, calories float64, day time.Time) DayPlan{

	//fmt.Println("calories from generatedayplan",calories)
	var dayPlan DayPlan
	dayPlan.day = day
	breakfastChannel := make(chan Recipe)
	lunchChannel := make(chan Recipe)
	dinnerChannel := make(chan Recipe)
	go returnRecipe(exclude, "Breakfast", calories / 3.0, breakfastChannel)
	go returnRecipe(exclude, "Lunch", calories / 3.0, lunchChannel)
	go returnRecipe(exclude, "Dinner", calories / 3.0, dinnerChannel)
	dayPlan.Breakfast = <- breakfastChannel
	dayPlan.Lunch = <-lunchChannel
	dayPlan.Dinner = <- dinnerChannel
	// dayPlan.Lunch = returnRecipe(exclude, "Lunch", calories / 3.0)
	// dayPlan.Dinner = returnRecipe(exclude, "Dinner", calories / 3.0)
	//fmt.Println("Total daily calories", dayPlan.Breakfast.Calories + dayPlan.Lunch.Calories + dayPlan.Dinner.Calories)
	return dayPlan
}

var generateMutex sync.Mutex
//GeneratePlanView is a view that returns a recipe back te the requester
func GeneratePlanView (w http.ResponseWriter, r *http.Request){
	// now := time.Now()
	var calories float64
	calories = 3000.0
	json.NewDecoder(r.Body).Decode(&calories)
	toExclude := []string{}
	weekPlan := weekPlan{}
	weekPlan.init()
	today := time.Now()
	var wg sync.WaitGroup
	for i := 1;i <= 7; i++{
		wg.Add(1)
		hours := i * 24
		dayTimeStamp := today.Add(time.Hour * time.Duration(hours))
		weekDay := dayTimeStamp.Weekday()
		go func(){
			generateMutex.Lock()
			weekPlan.plan[weekDay.String()] = generateDayPlan(&toExclude, calories, dayTimeStamp)
			generateMutex.Unlock()
			wg.Done()
		}()
	}
	wg.Wait()
	mw , err := json.Marshal(weekPlan.plan)
	if err!=nil{
		panic(err)
	}
	// fmt.Println(len(toExclude))
	w.Write([]byte(mw))
	// fmt.Println(time.Since(now).Microseconds())
}