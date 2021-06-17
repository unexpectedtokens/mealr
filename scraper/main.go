package scraper

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gocolly/colly"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/recipes"
)

// import (
// 	"fmt"
// 	"strconv"
// 	"strings"
// 	"sync"
// 	"time"

// 	"github.com/gocolly/colly"
// 	db "github.com/unexpectedtokens/mealr/database"
// 	"github.com/unexpectedtokens/mealr/logging"
// 	"github.com/unexpectedtokens/mealr/models"
// 	"github.com/unexpectedtokens/mealr/recipes"
// )

// type crawledRecipes []recipes.Recipe

// var calorieWordVariations []string = []string{"kcal", "cal", "calories"}

// func populateDBWithRecipes(recs crawledRecipes){
// 	fmt.Printf("Attempting db insertion with %d recipes\n", len(recs))
// 	numInserted := 0
// 	faultyRecs := 0
// 	db.InitDB()
// 	defer func(){
// 		if err := recover(); err != nil{
// 			fmt.Println("recovered in populateDB func", err)
// 		}
// 	}()
// 	defer func(){
// 		db.DBCon.Close()
// 		fmt.Println("Database connection closed")
// 	}()
// 	stmt, err := db.DBCon.Prepare("INSERT INTO recipes(title, source, serves, cals_provided, cals_per_serving, preptime, cooktime, source_url, image_url, vegan, vegetarian) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;")

// 	if err != nil {
// 		logging.ErrorLogger(err)
// 		panic(err)
// 	}

// 	ingStmt, err := db.DBCon.Prepare("INSERT INTO ingredients_from_recipe(recipeid, ingredient_measurement, ingredient_amount, ingredient_title) VALUES ($1, $2, $3, $4);")
// 	if err != nil {
// 		logging.ErrorLogger(err)
// 		panic(err)
// 	}
// 	metStmt, _ := db.DBCon.Prepare("INSERT INTO methods_from_recipe(recipeid, method) VALUES ($1, $2);")
// 	for _, x := range recs{
// 		time.Sleep(1000)
// 		fmt.Println("recipe title:", x.Title)
// 		fmt.Println("Amount of ingredients: ", len(x.IngredientsMisc))
// 		fmt.Println("Amount of method steps",  len(x.Method))
// 		if x.IsValidForDBInsertion(){
// 			var returnedID int
// 			err = stmt.QueryRow(x.Title, x.Source, x.Serves, x.CalsProvided, x.CalsPerServing, x.PrepTime, x.CookingTime, x.SourceURL, x.ImageURL, x.Vegan, x.Vegetarian).Scan(&returnedID)
// 			if err != nil{
// 				logging.ErrorLogger(err)
// 				panic(err)
// 			}
// 			insertionSuccesful := true
// 			for _, y := range x.IngredientsMisc{
// 				_, err = ingStmt.Exec(returnedID, y.Measurement, y.Amount, y.Title)
// 				if err != nil{
// 					insertionSuccesful = false
// 					logging.ErrorLogger(err)
// 					panic(err)
// 				}
// 			}
// 			if insertionSuccesful{
// 				for _, y := range x.Method{
// 					_, err = metStmt.Exec(returnedID, y )
// 					if err != nil{
// 						insertionSuccesful = false
// 						logging.ErrorLogger(err)
// 						panic(err)
// 					}
// 				}
// 			}
// 			if !insertionSuccesful{
// 				db.DBCon.Exec("DELETE FROM recipes WHERE id = $1", returnedID)
// 				faultyRecs++
// 				return
// 			}
// 			numInserted++
// 		}else{
// 			faultyRecs++
// 		}
// 	}
// 	fmt.Println(numInserted, "items inserted into the Database")
// 	fmt.Println(faultyRecs, "items not fit for db insertion")
// }

func populateDBWithFoodIngredients(ings []recipes.FoodIngredient){
	db.InitDB()
	defer func(){
		db.DBCon.Close()
	}()
	stmt, err := db.DBCon.Prepare("INSERT INTO food_ingredient(name, cal_per_100, serving_unit) VALUES ($1, $2, $3);")
	if err != nil{
		go logging.ErrorLogger(err, "scraper/main.go", "populateDBWithFoodIngredient")
		return
	}
	var goodInsertions int
	for _, x := range ings{
		_, err = stmt.Exec(x.Name, x.CalsPer100, x.ServingUnit)
		if err == nil {
			goodInsertions++
		}
	}
	fmt.Println(goodInsertions, "good insertions")
}

// var ingrediensMutex sync.Mutex
// var methodMutex sync.Mutex

// //CollectRecipes collects recipes from a specifiec url
// func CollectRecipesBBC(){

// 	var recipes crawledRecipes = crawledRecipes{}
// 	c := colly.NewCollector()
// 	c.OnRequest(func (r *colly.Request){
// 		fmt.Println("Visiting", r.URL.String())
// 	})
// 	hrefs := []string{}

// 	c.OnHTML("a[href]", func(el *colly.HTMLElement){
// 		if strings.Contains(el.Attr("class"), "promo"){
// 			link := el.Attr("href")
// 			absoluteURL := el.Request.AbsoluteURL(link)
// 			hrefs = append(hrefs, absoluteURL)
// 		}
// 	})
// 	c.OnHTML(".recipe-main-info", func(el *colly.HTMLElement){

// 		cr := recipes.Recipe{}
// 		cr.Source = "BBC"
// 		cr.Title = el.ChildText("h1")
// 		cr.SourceURL = el.Request.URL.String()
// 		el.ForEach(".recipe-ingredients__list-item", func(_ int, el *colly.HTMLElement){
// 			ingredient := recipes.Ingredient{Title: el.Text}
// 			ingrediensMutex.Lock()
// 			cr.IngredientsMisc = append(cr.IngredientsMisc, ingredient)
// 			ingrediensMutex.Unlock()
// 		})
// 		el.ForEach(".recipe-method__list-item-text", func(i int, el *colly.HTMLElement){
// 			methodMutex.Lock()
// 			cr.Method = append(cr.Method, fmt.Sprintf("%d %s", i+1, el.Text))
// 			methodMutex.Unlock()
// 		})

// 		prepTime := el.ChildText(".recipe-metadata__prep-time")
// 		prepTime = prepTime[0:(len(prepTime)/ 2)]
// 		cr.PrepTime = prepTime
// 		cookingtime := el.ChildText(".recipe-metadata__cook-time")
// 		cookingtime = cookingtime[0:(len(cookingtime)/ 2)]
// 		cr.CookingTime = cookingtime
// 		servingStringSlice := strings.Split(el.ChildText(".recipe-metadata__serving"), " ")
// 		for _, p := range servingStringSlice{
// 			if s, err :=  strconv.Atoi(p);err == nil{
// 				cr.Serves = s
// 			}
// 		}

// 		cr.ImageURL = el.ChildAttr(".recipe-media__image img", "src")

// 		description := el.ChildText(".recipe-description__text")
// 		if description != ""{
// 			descriptionStringSlice := strings.Split(description, " ")
// 			for i, w := range descriptionStringSlice{
// 				isFirst := i == 0
// 				isLast := i == (len(descriptionStringSlice) - 1)
// 				if s, err := strconv.Atoi(w); err == nil{
// 					isKcal := false
// 					for _, x := range calorieWordVariations{
// 						if !isFirst{
// 							if strings.Contains(descriptionStringSlice[i - 1], x){
// 								isKcal = true
// 							}
// 						}
// 						if !isLast{
// 							if strings.Contains(descriptionStringSlice[i + 1], x){
// 								isKcal = true
// 							}
// 						}
// 					}
// 					if isKcal{
// 						cr.CalsProvided = true
// 						cr.CalsPerServing = s
// 					}
// 				}

// 			}
// 		}

// 		recipes = append(recipes, cr)
// 	})
// 	alpha := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q" , "r", "s", "t", "u", "v" ,"w", "x","y", "z"}
// 	// testAlpha := []string{"q"}
// 	var wg sync.WaitGroup
// 	for _, x := range alpha{
// 		wg.Add(1)
// 		go func(l string){
// 			c.Visit(fmt.Sprintf("https://www.bbc.co.uk/food/recipes/a-z/%s/%d", l, 1))
// 			wg.Done()
// 		}(x)
// 	}
// 	wg.Wait()
// 	for _, x := range hrefs{
// 		wg.Add(1)
// 		go func(url string){
// 			c.Visit(url)
// 			wg.Done()
// 		}(x)
// 	}
// 	wg.Wait()
// 	populateDBWithRecipes(recipes)
// }

// type p struct {
// 	pages []int
// 	name string
// }
// func CollectRecipesEYS(){
// 	recipes := crawledRecipes{}
// 	dinnerPages := p{pages: []int{1,2,3,4,5,6,7,8,9,10}, name: "dinner"}
// 	breakfastPages := p{pages: []int{1,2,3,4,5}, name: "breakfast"}
// 	lunchPages := p{pages: []int{1,2,3,4,5, 6, 7}, name: "lunch"}

// 	snackPages := p{pages: []int{1,2 ,3, 4, 5}, name: "snacks"}
// 	colBase := []p{ snackPages, dinnerPages, lunchPages, breakfastPages}
// 	urlsToVisit := []string{}
// 	c := colly.NewCollector()
// 	c.OnHTML(".main", func(el *colly.HTMLElement){
// 		fmt.Println("visisted", el.Request.URL.String())

// 		recipe := recipes.Recipe{}
// 		recipe.Title = el.ChildText(".tasty-recipes-entry-header h2")
// 		fmt.Println(recipe.Title)
// 		vegan := el.ChildText(".main .icons .vegan")
// 		if vegan != ""{
// 			recipe.Vegan = true
// 		}
// 		vegetarian := el.ChildText(".main .icons .vegetarian")
// 		if vegetarian != ""{
// 			recipe.Vegetarian = true
// 		}
// 		el.ForEach(".tasty-recipe-ingredients ul li", func(i int, el *colly.HTMLElement){
// 			ingredient := models.Ingredient{}
// 			title := el.Text

// 			amountString := el.ChildAttr("span", "data-amount")
// 			amountSpecified := amountString != ""
// 			if amountSpecified {
// 				amount, err := strconv.ParseFloat(amountString, 32)
// 				if err == nil{
// 					ingredient.Amount = amount
// 				}else{
// 					amountSpecified = false
// 				}

// 			}
// 			measurement := el.ChildAttr("span", "data-unit")
// 			spanContent := el.ChildText("span")
// 			measurementSpecified := measurement != ""
// 			if measurementSpecified {
// 				ingredient.Measurement = measurement
// 			}
// 			title = strings.Replace(title, spanContent, "", -1)
// 			if string(title[0]) == "."{
// 				title = title[1:]
// 			}

// 			title = strings.Trim(title, " ")
// 			ingredient.Title = title

// 			recipe.IngredientsMisc = append(recipe.IngredientsMisc, ingredient)
// 		})
// 		el.ForEach(".tasty-recipe-instructions ol li", func (i int, el *colly.HTMLElement){
// 			recipe.Method = append(recipe.Method, fmt.Sprintf("%d %s", i, el.Text))
// 		})
// 		recInfo := el.ChildText(".tasty-recipes-notes p")
// 		if recInfo != ""{
// 			strSplitArr := strings.Split(recInfo, "•")
// 			for _, x := range strSplitArr{
// 				if strings.Contains(x, "Calories:"){
// 					s:=strings.Replace(x, "Calories: ", "", -1)
// 					s = strings.Trim(s, " ")
// 					parsedCalories, err  := strconv.Atoi(s)
// 					if err != nil{
// 						recipe.CalsProvided = true
// 						recipe.CalsPerServing = parsedCalories
// 					}
// 				}
// 			}
// 		}
// 		recipe.Source = "Eat yourself skinny"
// 		recipe.SourceURL = el.Request.URL.String()
// 		recipe.ImageURL = el.ChildAttr(".post-content img", "src")
// 		i, err := strconv.Atoi(el.ChildAttr(".yield span span", "data-amount"))
// 		if err == nil{
// 			recipe.Serves = i
// 		}
// 		recipe.PrepTime = el.ChildText(".tasty-recipes-time ul li.prep-time span.tasty-recipes-prep-time")
// 		recipe.CookingTime = el.ChildText(".tasty-recipes-time ul li.cook-time span.tasty-recipes-cook-time")
// 		if !recipe.CalsProvided{
// 			calories := el.ChildText(".tasty-recipes-nutrition ul li span.tasty-recipes-calories")
// 			caloriesParsed, err := strconv.Atoi(calories)
// 			if err != nil{
// 				recipe.CalsPerServing = caloriesParsed
// 				recipe.CalsProvided = true
// 			}
// 		}
// 		if recipe.ServingSize == ""{
// 			recipe.ServingSize = el.ChildText(".tasty-recipes-nutrition ul li span.tasty-recipes-serving-size")
// 		}
// 		recipes = append(recipes, recipe)

// 	})

// 	c.OnHTML(".post-square", func(el *colly.HTMLElement){
// 		href := el.ChildAttr("a", "href")
// 		urlsToVisit = append(urlsToVisit, href)
// 	})

// 	c.OnRequest(func (r *colly.Request){
// 		fmt.Println("Visiting", r.URL.String())
// 	})
// 	wg := sync.WaitGroup{}
// 	for _, x := range colBase{
// 		for _, y := range x.pages{
// 			wg.Add(1)
// 			go func(name string ,page int){
// 				c.Visit(fmt.Sprintf("https://www.eatyourselfskinny.com/category/recipes/%s/page/%d",name, page))
// 				wg.Done()
// 			}(x.name, y)
// 		}
// 	}
// 	wg.Wait()
// 	wg = sync.WaitGroup{}
// 	for _, u := range urlsToVisit{
// 		wg.Add(1)
// 		go func(url string){
// 			c.Visit(url)
// 			wg.Done()
// 		}(u)
// 	}
// 	wg.Wait()
// 	populateDBWithRecipes(recipes)
// }

func CollectIngredients(){
	c:= colly.NewCollector()
	categories := []string{}
	ingredients := []recipes.FoodIngredient{}
	c.OnHTML("#menu-calorie-tables", func(el *colly.HTMLElement){
		fmt.Println("visisting")
		el.ForEach("li", func(_ int, el *colly.HTMLElement){
			url := el.ChildAttr("a", "href")
			categories = append(categories, url)
		})
	})
	//ingredients := []models.Ingredient{}
	c.OnHTML("table", func(el *colly.HTMLElement){
		el.ForEach(".kt-row", func(_ int, el *colly.HTMLElement){
			ingredient := recipes.FoodIngredient{}
			ingredient.Name = el.ChildText("a")
			servingSize := el.ChildText(".serving")
			servingInfo := strings.Split(servingSize[strings.Index(servingSize,"(") + 1:strings.Index(servingSize, ")")], " ")
			//fmt.Println(servingInfo[0], servingInfo[1] )
			ingredient.ServingUnit = servingInfo[1]

			// serving, err := strconv.ParseFloat(servingInfo[0], 64)

			// if err != nil{
			// 	fmt.Println("unable to parse serving size: ", servingInfo[0])
			// 	return
			// }

			calories := el.ChildText(".kcal")

			calories = strings.Split(calories, " ")[0]
			caloriesParsed, err := strconv.Atoi(calories)
			if err != nil{
				fmt.Println("unable to parse calories: ", calories)
				return
			}

			ingredient.CalsPer100 = caloriesParsed
			ingredients = append(ingredients, ingredient)
		})

	})

	c.OnRequest(func(r *colly.Request){
		fmt.Println(r.URL.String())
	})
	c.Visit("https://www.calories.info/")

	for _, x := range categories{
		c.Visit(x)
	}
	populateDBWithFoodIngredients(ingredients)
}
//dinner 10
//breakfast 5
//lunch 7