package scraper

import (
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/gocolly/colly"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/models"
)





type crawledRecipes []models.Recipe

var cwvMutex sync.Mutex
var calorieWordVariations []string = []string{"kcal", "cal", "calories"}

func populateDBWithRecipes(recs crawledRecipes){

	numInserted := 0
	faultyRecs := 0
	db.InitDB()
	defer func(){
		db.DBCon.Close()
		fmt.Println("Database connection closed")
	}()
	stmt, err := db.DBCon.Prepare("INSERT INTO recipes(title, source, serves, cals_provided, cals_per_serving, preptime, cooktime, source_url, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;")
	
	if err != nil {
		panic(err)
	}
	ingStmt, err := db.DBCon.Prepare("INSERT INTO ingredients_from_recipe(recipeid, ingredient) VALUES ($1, $2);")
	if err != nil {
		panic(err)
	}
	metStmt, err := db.DBCon.Prepare("INSERT INTO methods_from_recipe(recipeid, method) VALUES ($1, $2);")
	for _, x := range recs{
		if x.IsValidForDBInsertion(){
			var returnedID int
			err = stmt.QueryRow(x.Title, x.Source, x.Serves, x.CalsProvided, x.CalsPerServing, x.PrepTime, x.CookingTime, x.SourceURL, x.ImageURL).Scan(&returnedID)
			if err != nil{
				fmt.Println(err)
				panic(err)
			}
			for _, y := range x.Ingredients{
				_, err = ingStmt.Exec(returnedID, y)
				if err != nil{
					fmt.Println(err)
				}	
			}
			for _, y := range x.Method{
				_, err = metStmt.Exec(returnedID, y )
				if err != nil{
					fmt.Println(err)
				}
			}
			numInserted++
		}else{
			faultyRecs++
		}
	}
	fmt.Println(numInserted, "items inserted into the Database")
	fmt.Println(faultyRecs, "items not fit for db insertion")
}

var ingrediensMutex sync.Mutex
var methodMutex sync.Mutex

//CollectRecipes collects recipes from a specifiec url
func CollectRecipes(){
	var foundRecipes int
	var recipes crawledRecipes = crawledRecipes{}
	c := colly.NewCollector()
	c.OnRequest(func (r *colly.Request){
		fmt.Println("Visiting", r.URL.String())
	})
	hrefs := []string{}

	c.OnHTML("a[href]", func(el *colly.HTMLElement){
		if strings.Contains(el.Attr("class"), "promo"){
			link := el.Attr("href")
			absoluteURL := el.Request.AbsoluteURL(link)
			hrefs = append(hrefs, absoluteURL)
		}
	})
	c.OnHTML(".recipe-main-info", func(el *colly.HTMLElement){
		foundRecipes++
		cr := models.Recipe{Ingredients: []string{}, Method: []string{}}
		cr.Source = "BBC"
		cr.Title = el.ChildText("h1")
		cr.SourceURL = el.Request.URL.String()
		el.ForEach(".recipe-ingredients__list-item", func(_ int, el *colly.HTMLElement){
			ingrediensMutex.Lock()
			cr.Ingredients = append(cr.Ingredients, el.Text)
			ingrediensMutex.Unlock()
		})
		el.ForEach(".recipe-method__list-item-text", func(i int, el *colly.HTMLElement){
			methodMutex.Lock()
			cr.Method = append(cr.Method, fmt.Sprintf("%d %s", i+1, el.Text))
			methodMutex.Unlock()
		})

		prepTime := el.ChildText(".recipe-metadata__prep-time")
		prepTime = prepTime[0:(len(prepTime)/ 2)]
		cr.PrepTime = prepTime
		cookingtime := el.ChildText(".recipe-metadata__cook-time")
		cookingtime = cookingtime[0:(len(cookingtime)/ 2)]
		cr.CookingTime = cookingtime
		servingStringSlice := strings.Split(el.ChildText(".recipe-metadata__serving"), " ")
		for _, p := range servingStringSlice{
			if s, err :=  strconv.Atoi(p);err == nil{
				cr.Serves = s
			}
		}

		cr.ImageURL = el.ChildAttr(".recipe-media__image img", "src")
		

		description := el.ChildText(".recipe-description__text")
		if description != ""{
			descriptionStringSlice := strings.Split(description, " ")
			for i, w := range descriptionStringSlice{
				isFirst := i == 0
				isLast := i == (len(descriptionStringSlice) - 1)
				if s, err := strconv.Atoi(w); err == nil{					
					isKcal := false
					for _, x := range calorieWordVariations{
						if !isFirst{
							if strings.Contains(descriptionStringSlice[i - 1], x){
								isKcal = true
							}
						}
						if !isLast{
							if strings.Contains(descriptionStringSlice[i + 1], x){
								isKcal = true
							}
						}
					}
					if isKcal{
						cr.CalsProvided = true
						cr.CalsPerServing = s
					}
				}

			}
		}
		
		recipes = append(recipes, cr)
	})
	alpha := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q" , "r", "s", "t", "u", "v" ,"w", "x","y", "z"}
	// testAlpha := []string{"q"}
	var wg sync.WaitGroup
	for _, x := range alpha{
		wg.Add(1)
		go func(l string){
			c.Visit(fmt.Sprintf("https://www.bbc.co.uk/food/recipes/a-z/%s/%d", l, 1))
			wg.Done()
		}(x)	
	}
	wg.Wait()
	for _, x := range hrefs{
		wg.Add(1)
		go func(url string){
			c.Visit(url)
			wg.Done()
		}(x)
	}
	wg.Wait()
	populateDBWithRecipes(recipes)
}