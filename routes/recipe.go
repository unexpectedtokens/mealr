package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/recipes"
	"github.com/unexpectedtokens/mealr/util"
)


type allRecipeResponseList []recipes.AllRecipeData


func fetchRecipeList(query string) (allRecipeResponseList, error){
	stmt, err := db.DBCon.Prepare(query)
	if err !=nil{
		return allRecipeResponseList{}, err
	}
	response := allRecipeResponseList{}
	rows, err := stmt.Query()
	if err != nil {
		return allRecipeResponseList{}, err
	}
	defer rows.Close()
	for rows.Next(){
		x := recipes.AllRecipeData{}
		var imageURL sql.NullString
		err := rows.Scan(&x.ID, &x.Title, &imageURL, &x.Username)
		if imageURL.Valid{
			x.ImageURL = imageURL.String
		}else{
			x.ImageURL = ""
		}
		if err == nil{
			response = append(response, x)
		}else{
			fmt.Println(err)
		}
	}
	return response, nil
}

func getParams(r *http.Request) (int, int){
	var offset int;
	var limit int = 10;
	urlValues := r.URL.Query()
	offsetQuery, ook := urlValues["offset"]
	limitQuery, lok := urlValues["limit"]
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
	return limit, offset
}

//AllRecipes lists all recipes
func AllRecipes(w http.ResponseWriter, r *http.Request){
	limit, offset := getParams(r)
	recipes, err := fetchRecipeList(fmt.Sprintf("SELECT r.id, r.title, r.image_url, u.username FROM recipes r INNER JOIN users u ON r.owner = u.id LIMIT %d OFFSET %d;", limit, offset))
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	fmt.Println(recipes, offset, limit)
	response, err := json.Marshal(recipes)
	
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	w.Write(response)
}
func MyRecipes(w http.ResponseWriter, r *http.Request){
	if util.CheckIfMethodAllowed(w, r, []string{"GET"}){
		if userid, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
			limit, offset := getParams(r)
			recipes, err := fetchRecipeList(fmt.Sprintf("SELECT r.id, r.title, r.image_url, u.username FROM recipes r INNER JOIN users u ON r.owner = u.id WHERE r.owner = %d LIMIT %d OFFSET %d;", userid, limit, offset))
			if err != nil{
				util.HTTPServerError(w)
				return
			}
			response, err := json.Marshal(recipes)
			if err != nil{
				fmt.Println(err)
				util.HTTPServerError(w)
				return
			}
			w.Write(response)
		} else {
			auth.ReturnUnauthorized(w)
		}
	}else{
		util.HTTPErrorWrongMethod(w)
	}
}

func FetchFavouriteRecipes(w http.ResponseWriter, r *http.Request){
	// if util.CheckIfMethodAllowed(w,r,[]string{"GET"}){
	// 	if userid, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
	// 		limit, offset := getParams(r)
	// 		recipes, err := fetchRecipeList("SELECT * FROM favourites ")
	// 		if err != nil{
	// 			util.HTTPServerError(w)
	// 			return
	// 		}
	// 		response, err := json.Marshal(recipes)
	// 		if err != nil{
	// 			util.HTTPServerError(w)
	// 			return
	// 		}
	// 		w.Write(response)
	// 	}else{
	// 		auth.ReturnUnauthorized(w)
	// 	}
	// } else{
	// 	util.HTTPErrorWrongMethod(w)
	// }
}


func getIDFromString(url string) (id int, err error){
	splitURL := strings.Split(url, "/")
	idStr := splitURL[len(splitURL) - 1]
	id, err = strconv.Atoi(idStr)
	if err != nil{
		return id, err
	}
	return id, nil
}

//RecipeDetail returns detailinfo about a recipe
func RecipeDetail(w http.ResponseWriter, r *http.Request){
	id, err := getIDFromString(r.URL.String())
	if err != nil{
		util.ReturnBadRequest(w)
		return
	}
	stmt, err := db.DBCon.Prepare(`
	SELECT 
	r.id,
	r.title,
	r.image_url,
	r.source,
	r.source_url,
	r.preptime,
	r.cooktime,
	r.vegan,
	r.vegetarian,
	r.type_of_meal, 
	u.username
	FROM recipes r INNER JOIN users u ON u.id = r.owner
	WHERE r.id = $1;`)
	if err != nil{
		fmt.Println(err)
		util.HTTPServerError(w)
		return
	}
	recipe := recipes.Recipe{}
	var imageURL sql.NullString
	var sourceURL sql.NullString
	var source sql.NullString
	var prepTime sql.NullString
	var cookingTime sql.NullString
	var vegan = sql.NullBool{}
	var veggie = sql.NullBool{}
	err = stmt.QueryRow(id).Scan(&recipe.ID, &recipe.Title, &imageURL, &source, &sourceURL, &prepTime, &cookingTime, &vegan, &veggie, &recipe.TypeOfMeal, &recipe.Owner.Username)
	if err != nil {
		fmt.Println(err)
		util.ReturnNotFound(w)
		return
	}
	
	recipe.ImageURL = imageURL.String
	recipe.SourceURL = sourceURL.String
	recipe.Source = source.String
	recipe.PrepTime = prepTime.String
	recipe.CookingTime = cookingTime.String
	if vegan.Valid{
		recipe.Vegan = vegan.Bool
	}
	if veggie.Valid{
		recipe.Vegetarian = veggie.Bool
	}
	jsonResponse, err := json.Marshal(recipe)
	if err != nil{
		logging.ErrorLogger(err, "routes/recipe.go", "recipedetail")
		util.HTTPServerError(w)
		return
	}
	w.Write(jsonResponse)
	
	
	
}

func RecipeFoodIngredientDetail(w http.ResponseWriter, r *http.Request){
	id, err := getIDFromString(r.URL.String())
	if err != nil{
		util.ReturnBadRequest(w)
		return
	}
	var stmt *sql.Stmt
	stmt, err = db.DBCon.Prepare("SELECT iffr.amount, foi.name, foi.cal_per_100, foi.serving_unit FROM ingredients_from_foodingredient_from_recipe iffr INNER JOIN food_ingredient foi ON foi.id = iffr.foodingredient_id WHERE iffr.recipeid = $1;")
	if err != nil{
		logging.ErrorLogger(err, "routes/recipe.go", "recipeDetail")
		util.HTTPServerError(w)
		return
	}
	var rows *sql.Rows
	rows, err = stmt.Query(id)
	
	if err != nil{
		logging.ErrorLogger(err, "routes/recipe.go", "recipeDetail")
		util.HTTPServerError(w)
		return
	}
	defer rows.Close()
	iffr := recipes.RecipeFoodIngredientList{}
	for rows.Next(){
		ri := recipes.RecipeIngredientFromFoodIngredient{}
		fi := recipes.FoodIngredient{}
		err := rows.Scan(&ri.Amount, &fi.Name, &fi.CalsPer100, &fi.ServingUnit)
		if err != nil {
			logging.ErrorLogger(err, "routes/recipe.go", "recipeDetail")
			return
		}
		ri.FoodIngredient = fi
		iffr = append(iffr, ri)
	}
	
	
}
func RecipeIngredientDetail(w http.ResponseWriter, r *http.Request){
	id, err := getIDFromString(r.URL.String())
	if err != nil{
		util.ReturnBadRequest(w)
		return
	}
	stmt, err := db.DBCon.Prepare("SELECT ingredient_title, ingredient_amount, ingredient_measurement FROM ingredients_from_recipe WHERE recipeid=$1;")
	if err != nil{
		util.HTTPServerError(w)
		return
	}
	rows, err := stmt.Query(id)
	if err != nil{
		util.HTTPServerError(w)
		return
	}
	defer rows.Close()
	miscIng := recipes.IngredientsMisc{}
	for rows.Next(){
		var ing recipes.Ingredient
		rows.Scan(&ing.Title, &ing.Amount, &ing.Measurement)		
		miscIng = append(miscIng, ing)
	}
	
}

func RecipeMethodDetail(w http.ResponseWriter, r *http.Request){
	id, err := getIDFromString(r.URL.String())
	if err != nil{
		util.ReturnBadRequest(w)
		return
	}
	stmt, err := db.DBCon.Prepare("SELECT method FROM methods_from_recipe WHERE recipeid=$1;")
	if err != nil{
		util.HTTPServerError(w)
		return
	}
	rows, err := stmt.Query(id)
	if err != nil{
		util.HTTPServerError(w)
		return
	}
	defer rows.Close()
	methods:=recipes.MethodFromRecipe{}
	for rows.Next(){
		var met string
		rows.Scan(&met)		
		methods = append(methods, met)
	}
	
	response, err := json.Marshal(methods)
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	w.Write(response)
}



type createdResponse struct{
	ID int64
}


func CreateRecipeView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"POST"}){
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		//file := r.ParseMultipartForm(10<<20)
		var parsedRequest recipes.Recipe
		err := json.NewDecoder(r.Body).Decode(&parsedRequest)
		if err != nil{
			defer logging.ErrorLogger(err, "routes/recipe.go", "CreateRecipeView")
			util.ReturnBadRequest(w)
			return
		}
		if !parsedRequest.IsValidForDBInsertion(){
			util.ReturnBadRequest(w)
			return
		}
		fmt.Println(parsedRequest)
		var stmt *sql.Stmt	
		stmt, err = db.DBCon.Prepare("INSERT INTO recipes (owner, title, description, source, type_of_meal) VALUES($1, $2, $3, '/', $4) RETURNING id;")
		if err != nil{
			logging.ErrorLogger(err, "routes/recipe.go", "CreateRecipeView")
			util.HTTPServerError(w)
			return
		}
		defer stmt.Close()
		row := stmt.QueryRow(derivedID, parsedRequest.Title, parsedRequest.Description, parsedRequest.TypeOfMeal)
		var returnedID int
		err = row.Scan(&returnedID)
		if err != nil{
			util.HTTPServerError(w)
			defer logging.ErrorLogger(err, "routes/recipe.go", "CreateRecipeView")
			return
		}
		response := createdResponse{ID: int64(returnedID)}
		jsonResponse, err := json.Marshal(&response)
		if err != nil{
			util.HTTPServerError(w)
			return
		}
		w.WriteHeader(http.StatusCreated)
		w.Write(jsonResponse)
	}
}

type recipeIDrequest struct{
	ID int64
}

func RecipeBannerView(w http.ResponseWriter, r *http.Request){
	request := recipeIDrequest{}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil{
		fmt.Println(err)
		util.ReturnBadRequest(w)
		return
	}
	id:=request.ID
	r.ParseMultipartForm(10 << 20)
	file, handler, err := r.FormFile("banner")
	if err != nil{
		http.Error(w, "Unable to parse image", http.StatusBadRequest)
		defer logging.ErrorLogger(err, "routes/recipe.go", "RecipeBannerView")
		return
	}
	defer file.Close()
	fmt.Println("recipeid:", id)
	fmt.Printf("Uploaded File: %+v\n", handler.Filename)
    fmt.Printf("File Size: %+v\n", handler.Size)
    fmt.Printf("MIME Header: %+v\n", handler.Header)

}


func GetAllFoodIngredientsView(w http.ResponseWriter, r *http.Request){
	if !util.CheckIfMethodAllowed(w, r, []string{"GET"}){
		return
	}
	urlValues := r.URL.Query()
	querytext, ok := urlValues["ingredient"]
	var query string
	querystring := "SELECT id, name, cal_per_100, serving_unit FROM food_ingredient"
	if ok{
		querystring += " WHERE name ILIKE $1 LIMIT 20;"
		query = "%" + querytext[0] + "%"
	} else{
		querystring += " LIMIT 20;"
	}
	fmt.Println(querystring)
	stmt, err := db.DBCon.Prepare(querystring)
	if err != nil {
		logging.ErrorLogger(err, "routes/recipe.go", "GetAllFoodIngredientsView")		
		util.HTTPServerError(w)
		return
	}
	var rows *sql.Rows
	if ok{
		rows, err = stmt.Query(query)
	}else {
		rows, err = stmt.Query()
	}
	if err !=nil{
		logging.ErrorLogger(err, "routes/recipe.go", "GetAllFoodIngredientsView")
		util.HTTPServerError(w)
		return
	}
	ings := []recipes.FoodIngredient{}
	for rows.Next(){
		ing := recipes.FoodIngredient{}
		err = rows.Scan(&ing.ID, &ing.Name, &ing.CalsPer100, &ing.ServingUnit)
		if err != nil {
			logging.ErrorLogger(err, "routes/recipe.go", "GetAllFoodIngredientsView")
			return
		}
		ings = append(ings, ing)
	}
	resp, err := json.Marshal(&ings)
	if err != nil{
		logging.ErrorLogger(err, "routes/recipe.go", "GetAllFoodIngredientsView")
		util.HTTPServerError(w)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	w.Write(resp)
}