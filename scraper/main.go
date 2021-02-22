package scraper

import (
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/gocolly/colly"
	db "github.com/unexpectedtokens/mealr/database"
)

type crawledRecipe struct{
	Title string
	Source string
	Ingredients []string
	Method []string
	PrepTime string
	CookingTime string
	Serves int
	CalsProvided bool
	CalsPerServing int
	Vegetarian bool
	Vegan bool
}

func (c *crawledRecipe) isValid() (valid bool) {
	valid = true
	valid = c.Title != "" && valid
	return valid
}

type crawledRecipes []crawledRecipe

var cwvMutex sync.Mutex
var calorieWordVariations []string = []string{"kcal", "cal", "calories"}

func populateDBWithRecipes(recs crawledRecipes){
	numInserted := 0
	db.InitDB()
	defer func(){
		db.DBCon.Close()
		fmt.Println("Database connection closed")
	}()
	stmt, err := db.DBCon.Prepare("INSERT INTO recipes(title, source, serves, cals_provided, cals_per_serving, preptime, cooktime) VALUES ($1, $2, $3, $4, $5, $6, $7);")
	if err != nil {
		panic(err)
	}
	for _, x := range recs{
		if x.isValid(){
		_, err := stmt.Exec(x.Title, x.Source, x.Serves, x.CalsProvided, x.CalsPerServing, x.PrepTime, x.CookingTime)
		if err != nil{
			fmt.Println(err)
			panic(err)
		}
		numInserted++
		}
	}
	fmt.Println(numInserted, "items inserted into the Database")
}

var ingrediensMutex sync.Mutex
var methodMutex sync.Mutex
//"1861e8efd7330b4d50bc444ff93e55c"

//CollectRecipes collects recipes from a specifiec url
func CollectRecipes(){
	var recipes crawledRecipes = []crawledRecipe{}
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
		cr := crawledRecipe{Ingredients: []string{}, Method: []string{}}
		cr.Title = el.ChildText("h1")
		cr.Source = el.Request.URL.String()
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
								fmt.Println("Contains!")
								isKcal = true
							}
						}
						if !isLast{
							if strings.Contains(descriptionStringSlice[i + 1], x){
								fmt.Println("Contains")
								isKcal = true
							}
						}
					}
					if isKcal{
						cr.CalsProvided = true
						cr.CalsPerServing = s
						fmt.Println(cr.CalsPerServing, cr.CalsProvided)
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