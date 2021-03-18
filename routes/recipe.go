package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/models"
	"github.com/unexpectedtokens/mealr/util"
)





type allRecipeResponseList []models.AllRecipeData

//AllRecipes lists all recipes
func AllRecipes(w http.ResponseWriter, r *http.Request){
	var offset int;
	var limit int = 10;
	offsetQuery, ook := r.URL.Query()["offset"]
	limitQuery, lok := r.URL.Query()["limit"]
	if ook {
		i, err :=strconv.Atoi(offsetQuery[0])
		if err == nil{
			offset = i
		}
	}
	if lok {
		i, err :=strconv.Atoi(limitQuery[0])
		if err == nil{
			limit = i
		}
	}
	stmt, err := db.DBCon.Prepare("SELECT id, title, image_url, source FROM recipes WHERE image_url LIKE $1 LIMIT $2 OFFSET $3;")
	if err !=nil{
		fmt.Println(err)
		util.HTTPServerError(w)
		return
	}
	recipes := allRecipeResponseList{}
	rows, err := stmt.Query("http%", limit ,offset)
	if err != nil {
		fmt.Println(err)
		util.HTTPServerError(w)
		return
	}
	defer rows.Close()
	
	for rows.Next(){
		recipe := models.AllRecipeData{}
		rows.Scan(&recipe.ID, &recipe.Title, &recipe.ImageURL, &recipe.Source)
		recipes = append(recipes, recipe)
	}
	response, err := json.Marshal(recipes)
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	w.Write(response)
}





//RecipeDetail returns detailinfo about a recipe
func RecipeDetail(w http.ResponseWriter, r *http.Request){
	splitURL := strings.Split(r.URL.String(), "/")
	idStr := splitURL[len(splitURL) - 1]
	id, err := strconv.Atoi(idStr)
	if err != nil{
		util.ReturnBadRequest(w)
		return
	}
	
	stmt, err := db.DBCon.Prepare(`
	SELECT 
	id,
	title,
	image_url,
	source,
	source_url,
	preptime,
	cooktime,
	cals_provided,
	cals_per_serving
	FROM recipes 
	WHERE id = $1;`)
	if err != nil{
		fmt.Println(err)
		util.HTTPServerError(w)
		return
	}
	recipe := models.Recipe{}
	recipe.Ingredients = []string{}
	recipe.Method = []string{}
	err = stmt.QueryRow(id).Scan(&recipe.ID, &recipe.Title, &recipe.ImageURL, &recipe.Source, &recipe.SourceURL, &recipe.PrepTime, &recipe.CookingTime, &recipe.CalsProvided,&recipe.CalsPerServing)
	if err != nil {
		util.ReturnNotFound(w)
		return
	}
	stmt, err = db.DBCon.Prepare("SELECT ingredient FROM ingredients_from_recipe WHERE recipeid=$1;")
	rows, err := stmt.Query(recipe.ID)
	for rows.Next(){
		var ing string
		rows.Scan(&ing)		
		recipe.Ingredients = append(recipe.Ingredients, ing)
	}
	stmt, err = db.DBCon.Prepare("SELECT method FROM methods_from_recipe WHERE recipeid=$1;")
	rows, err = stmt.Query(recipe.ID)
	for rows.Next(){
		var met string
		rows.Scan(&met)		
		recipe.Method = append(recipe.Method, met)
	}
	response, err := json.Marshal(recipe)
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	w.Write(response)
}




	

