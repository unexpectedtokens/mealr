package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/mediahandler"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/recipes"
	"github.com/unexpectedtokens/mealr/util"
)

type listQuery string


const all listQuery = "all"
const mine listQuery = "mine"
const fav listQuery = "fav"

func getIDfromString(id string) (int64, error){
	intID, err := strconv.Atoi(id)
	if err != nil {
		return 0, err
	}
	int64ID := int64(intID)
	return int64ID, nil
}

func checkIfLikedByUser(userid, recipeid int64) (bool, error){
	var id int64
	err := statements.LikedByUserSTMT.QueryRow(userid, recipeid).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	if err == sql.ErrNoRows{
		return false, nil
	}
	if id == 0{
		return false, nil
	}
	return true, nil

}

func getAllLikesFromRecipe(id int64) (jsonResponse []byte, err error){
	var Likes LikesStruct
	err = statements.AllLikeFromRecipeSTMT.QueryRow(id).Scan(&Likes.Likes)
	if err != nil && err != sql.ErrNoRows{
		jsonResponse, err = json.Marshal(Likes)
		if err != nil{
			return jsonResponse, err
		}
		return jsonResponse, nil
	}
	jsonResponse, err  = json.Marshal(Likes)
	if err != nil {
		return []byte{}, err
	}
	return 
}

type allRecipeResponseList []recipes.AllRecipeData
type prepared struct{
	GetFoodIngFromRecipeSTMT, 
	GetMiscIngFromRecipeSTMT, 
	GetMethodFromRecipeSTMT, 
	GetRecipeDetailSTMT, 
	CheckUserIsOwnerSTMT,
	RecipeFoodIngredientCreateSTMT, 
	RecipeFoodIngredientDeleteSTMT,
	RecipeMiscIngredientCreateSTMT, 
	RecipeMiscIngredientDeleteSTMT,
	MethodStepDeleteSTMT,
	MethodStepUpdateSTMT,
	AllRecipeSTMT,
	FavouriteRecipeSTMT,
	AllLikeFromRecipeSTMT,
	LikedByUserSTMT,
	MyRecipeSTMT,
	AddToFavSTMT,
	RemoveFromFavSTMT,
	CreateNoteSTMT,
	UpdateNoteSTMT,
	DeleteNoteSTMT,
	GetNotesSTMT,
	MethodStepCreateSTMT *sql.Stmt
}

var statements prepared

func prepareRecipeStatements() error{
	statements = prepared{}
	var err error
	statements.GetFoodIngFromRecipeSTMT, err = db.DBCon.Prepare("SELECT iffr.id, iffr.amount, foi.name, foi.cal_per_100, foi.serving_unit FROM ingredients_from_foodingredient_from_recipe iffr INNER JOIN food_ingredient foi ON foi.id = iffr.foodingredient_id WHERE iffr.recipeid = $1;")
	if err != nil {
		return err
	}
	statements.GetMiscIngFromRecipeSTMT, err = db.DBCon.Prepare("SELECT id, ingredient_title, ingredient_amount, ingredient_measurement FROM ingredients_from_recipe WHERE recipeid=$1;")
	if err != nil {
		return err
	}
	statements.GetMethodFromRecipeSTMT, err = db.DBCon.Prepare("SELECT id, method, moment_added, duration_in_minutes  FROM methods_from_recipe WHERE recipeid=$1;")
	if err != nil {
		return err
	}
	statements.GetRecipeDetailSTMT, err = db.DBCon.Prepare(`
	SELECT 
	r.id,
	r.title,
	r.image_url,
	r.source,
	r.source_url,
	r.vegan,
	r.vegetarian,
	r.type_of_meal, 
	u.username,
	r.description,
	r.public
	FROM recipes r INNER JOIN users u ON u.id = r.owner
	WHERE r.id = $1;`)
	if err != nil{
		return err
	}
	statements.CheckUserIsOwnerSTMT, err = db.DBCon.Prepare("SELECT owner FROM recipes WHERE id = $1;")
	if err != nil {
		return err
	}
	statements.RecipeFoodIngredientCreateSTMT, err = db.DBCon.Prepare("INSERT INTO ingredients_from_foodingredient_from_recipe (amount, recipeid, foodingredient_id) VALUES ($1, $2, $3) RETURNING id;")
	if err != nil {
		return err
	}
	statements.RecipeMiscIngredientCreateSTMT, err = db.DBCon.Prepare("INSERT INTO ingredients_from_recipe (recipeid, ingredient_measurement, ingredient_amount, ingredient_title) VALUES ($1, $2, $3, $4) RETURNING id;")
	if err != nil {
		return err
	}
	statements.MethodStepCreateSTMT, err = db.DBCon.Prepare("INSERT INTO methods_from_recipe (recipeid, method, moment_added, duration_in_minutes) VALUES ($1, $2, $3, $4) RETURNING id;")
	if err != nil {
		return err
	}
	statements.RecipeFoodIngredientDeleteSTMT, err = db.DBCon.Prepare("DELETE FROM ingredients_from_foodingredient_from_recipe WHERE id = $1;")
	if err != nil {
		return err
	}
	statements.RecipeMiscIngredientDeleteSTMT, err = db.DBCon.Prepare("DELETE FROM ingredients_from_recipe WHERE id = $1;")
	if err != nil {
		return err
	}
	statements.MethodStepDeleteSTMT, err = db.DBCon.Prepare("DELETE FROM methods_from_recipe WHERE id = $1;")
	if err != nil {
		return err
	}
	statements.MethodStepUpdateSTMT, err = db.DBCon.Prepare("UPDATE methods_from_recipe SET duration_in_minutes = $1, method = $2 WHERE id = $3;")
	if err != nil {
		return fmt.Errorf("error creating update methodstep statement: %s", err.Error())
	}
	statements.AllLikeFromRecipeSTMT, err = db.DBCon.Prepare("SELECT COUNT(*) FROM favourite_recipes WHERE recipeid = $1;")
	if err != nil {
		return err
	}
	statements.AllRecipeSTMT, err = db.DBCon.Prepare(`SELECT
	r.id,
	r.title,
	r.image_url,
	COUNT(f.id) AS f_count
FROM recipes r
LEFT JOIN favourite_recipes f on f.recipeid = r.id
WHERE r.public OR r.owner = 1
GROUP BY f.recipeid, r.id
ORDER BY f_count DESC
LIMIT $1 OFFSET $2;`)
  if err != nil {
	  return fmt.Errorf("error creating allrecipeSTMT: %s", err.Error())
  }
  statements.MyRecipeSTMT, err = db.DBCon.Prepare(`SELECT
  r.id,
  r.title,
  r.image_url,
  COUNT(f.id) AS f_count
FROM recipes r
LEFT JOIN favourite_recipes f on f.recipeid = r.id
WHERE r.owner = $1
GROUP BY r.id, f.recipeid
ORDER BY f_count DESC
LIMIT $2 OFFSET $3;`)
	if err != nil {
		return fmt.Errorf("error creating MyRecipeSTMT: %s", err.Error())
	}
	statements.FavouriteRecipeSTMT, err = db.DBCon.Prepare(`SELECT
	r.id,
	r.title,
	r.image_url,
	COUNT(f.id) AS f_count
	FROM recipes r
	LEFT JOIN favourite_recipes f on f.recipeid = r.id
	WHERE f.userid = $1 AND r.public
	GROUP BY r.id, f.id
	ORDER BY f_count DESC
	LIMIT $2 OFFSET $3;`)
	if err != nil {
		return fmt.Errorf("error creating favRecipeSTMT: %s", err.Error())
	}
	statements.LikedByUserSTMT, err = db.DBCon.Prepare("SELECT id FROM favourite_recipes WHERE userid = $1 AND recipeid = $2;")
	if err != nil{
		return fmt.Errorf("error preprating likedbyuser statement: %s", err.Error())
	}
	statements.AddToFavSTMT, err = db.DBCon.Prepare("INSERT INTO favourite_recipes (recipeid, userid) VALUES ($1, $2);")
	if err != nil{
		return fmt.Errorf("error preprating addtofav statement: %s", err.Error())
	}
	statements.RemoveFromFavSTMT, err = db.DBCon.Prepare("DELETE FROM favourite_recipes WHERE userid = $1 AND recipeid = $2;")
	if err != nil{
		return fmt.Errorf("error preprating removefromfav statement: %s", err.Error())
	}
	statements.CreateNoteSTMT, err = db.DBCon.Prepare("INSERT INTO notes_to_recipes (recipeid, userid, note_text) VALUES ($1, $2, $3);")
	if err != nil {
		return fmt.Errorf("error creating create note statement: %s", err.Error())
	}
	statements.UpdateNoteSTMT, err = db.DBCon.Prepare("UPDATE notes_to_recipes SET note_text = $1 WHERE id = $2;")
	if err != nil {
		return fmt.Errorf("error creating update note statement: %s", err.Error())
	}
	statements.DeleteNoteSTMT, err = db.DBCon.Prepare("DELETE FROM notes_to_recipes WHERE id = $1;")
	if err != nil {
		return fmt.Errorf("error creating delete note statement: %s", err.Error())
	}
	statements.GetNotesSTMT, err = db.DBCon.Prepare("SELECT note_text, created_at FROM notes_to_recipes WHERE recipeid = $1 AND userid = $2;")
	if err != nil {
		return fmt.Errorf("error creating select notes statement: %s", err.Error())
	}
	
	return nil
}

func fetchRecipeList(queryType listQuery, userid int64, limit, offset int) (jsonresponse []byte, err error){
	var rows *sql.Rows
	switch queryType{
	case all:
		rows, err = statements.AllRecipeSTMT.Query(limit, offset)
	case fav:
		rows, err = statements.FavouriteRecipeSTMT.Query(userid, limit, offset)
	case mine:
		rows, err = statements.MyRecipeSTMT.Query(userid, limit, offset)
	default:
		return jsonresponse, fmt.Errorf("error: not a valid queryType")
	}

	if err != nil && err != sql.ErrNoRows{
		return jsonresponse, fmt.Errorf("error querying statement: %s, querytype: %s, userid: %d, limit: %d, offset: %d", err.Error(), queryType, userid, limit, offset)
	}
	defer rows.Close()
	response := allRecipeResponseList{}
	
	for rows.Next(){
		x := recipes.AllRecipeData{}
		var imageURL sql.NullString
		rows.Scan(&x.ID, &x.Title, &imageURL, &x.Likes)
		x.ImageURL = imageURL.String
		likedByUserID := 0
		err = statements.LikedByUserSTMT.QueryRow(userid, x.ID).Scan(&likedByUserID)
		if err != nil && err != sql.ErrNoRows{
			fmt.Println(err)
		}
		x.LikedByUser = likedByUserID > 0
		if err == nil || err == sql.ErrNoRows{
			response = append(response, x)
		}else{
			fmt.Println(err)
		}
	}
	jsonresponse, err = json.Marshal(response)
	if err != nil {
		return jsonresponse, fmt.Errorf("error creating json response: %s", err.Error())
	}
	return jsonresponse, nil
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
func AllRecipes(w http.ResponseWriter, r *http.Request, _ httprouter.Params){
	if userid, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{

		limit, offset := getParams(r)
		jsonresponse, err := fetchRecipeList(all, int64(userid), limit, offset)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println("allrecipe err", err)
			return
		}
		w.Write(jsonresponse)
	} else {
		auth.ReturnUnauthorized(w)
	}	
}

func MyRecipes(w http.ResponseWriter, r *http.Request, _ httprouter.Params){
	if userid, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		limit, offset := getParams(r)
		jsonresponse, err := fetchRecipeList(mine, int64(userid), limit, offset)
		if err != nil{
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		w.Write(jsonresponse)
	} else {
		auth.ReturnUnauthorized(w)
	}	
}

func FetchFavouriteRecipes(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	if userid, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		limit, offset := getParams(r)
		jsonResponse, err := fetchRecipeList(fav, int64(userid), limit, offset)
		if err != nil{
			util.HTTPServerError(w)
			return
		}
		w.Write(jsonResponse)
	}else{
		auth.ReturnUnauthorized(w)
	}
}




//RecipeDetail returns detailinfo about a recipe
func RecipeDetail(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	id := ps.ByName("id")
	recipe := recipes.Recipe{}
	var imageURL sql.NullString
	var sourceURL sql.NullString
	var source sql.NullString
	var vegan = sql.NullBool{}
	var veggie = sql.NullBool{}
	var description = sql.NullString{}
	var public = sql.NullBool{}
	err := statements.GetRecipeDetailSTMT.QueryRow(id).Scan(&recipe.ID, &recipe.Title, &imageURL, &source, &sourceURL, &vegan, &veggie, &recipe.TypeOfMeal, &recipe.Owner.Username, &description, &public)
	if err != nil {
		fmt.Println(err)
		util.ReturnNotFound(w)
		return
	}
	recipe.ImageURL = imageURL.String
	recipe.SourceURL = sourceURL.String
	recipe.Source = source.String
	recipe.Description = description.String
	if vegan.Valid{
		recipe.Vegan = vegan.Bool
	}
	if veggie.Valid{
		recipe.Vegetarian = veggie.Bool
	}
	recipe.Public = public.Bool
	jsonResponse, err := json.Marshal(recipe)
	if err != nil{
		logging.ErrorLogger(err, "routes/recipe.go", "recipedetail")
		util.HTTPServerError(w)
		return
	}
	w.Write(jsonResponse)	
}

func RecipeFoodIngredientDetail(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	id := ps.ByName("id")
	var rows *sql.Rows
	rows, err := statements.GetFoodIngFromRecipeSTMT.Query(id)
	
	if err != nil && err != sql.ErrNoRows{
		logging.ErrorLogger(err, "routes/recipe.go", "recipeDetail")
		util.HTTPServerError(w)
		return
	}
	defer rows.Close()
	iffr := recipes.RecipeFoodIngredientList{}
	for rows.Next(){
		ri := recipes.RecipeIngredientFromFoodIngredient{}
		fi := recipes.FoodIngredient{}
		err := rows.Scan(&ri.ID, &ri.Amount, &fi.Name, &fi.CalsPer100, &fi.ServingUnit)
		if err != nil {
			logging.ErrorLogger(err, "routes/recipe.go", "recipeDetail")
			return
		}
		ri.FoodIngredient = fi
		iffr = append(iffr, ri)
	}	
	response, err := json.Marshal(iffr)
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	w.Write(response)

}

func checkIfRequesteeIsRecipeOwner(recipeID int64, requesteeID auth.UserID) error{
	var OwnerID auth.UserID
	row:=statements.CheckUserIsOwnerSTMT.QueryRow(recipeID)
	err := row.Scan(&OwnerID)
	if err != nil {
		return fmt.Errorf("error scanning into row: %s", err.Error())
	}
	if OwnerID != requesteeID{
		return fmt.Errorf("error: requestee is not owner")
	}
	return nil
}

func RecipeFoodIngredientCreate(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)
	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil{
			auth.ReturnUnauthorized(w)
			return
		}
		fi := recipes.RecipeIngredientFromFoodIngredient{}
		err := json.NewDecoder(r.Body).Decode(&fi)
		if err != nil {
			util.ReturnBadRequest(w)
			fmt.Println(err)
			return
		}
		var createdID int64

		err = statements.RecipeFoodIngredientCreateSTMT.QueryRow(fi.Amount, id, fi.FoodIngredientID).Scan(&createdID)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		fi.ID = createdID
		response, err := json.Marshal(fi)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(response)

	}else {
		util.HTTPServerError(w)
		fmt.Println("no id")
		return
	}
}

func RecipeMiscIngredientCreate(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)
	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil{
			auth.ReturnUnauthorized(w)
			return
		}
		mi := recipes.Ingredient{}
		err := json.NewDecoder(r.Body).Decode(&mi)
		if err != nil {
			util.ReturnBadRequest(w)
			fmt.Println(err)
			return
		}
		var createdID int64
		err = statements.RecipeMiscIngredientCreateSTMT.QueryRow(id, mi.Measurement, mi.Amount, mi.Title).Scan(&createdID)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}		
		mi.ID = createdID
		jsonResponse, err := json.Marshal(mi)
		if err != nil{
			w.WriteHeader(200)
			w.Write([]byte("created but json error"))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResponse)

	}else {
		util.HTTPServerError(w)
		fmt.Println("no id")
		return
	}
}
func RecipeMiscIngredientDelete(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)
	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil {
			auth.ReturnUnauthorized(w)
			return
		}
		miid := ps.ByName("miid")
		_, err = statements.RecipeMiscIngredientDeleteSTMT.Exec(miid)
		if err != nil {
			util.HTTPServerError(w)
			return
		}
		w.WriteHeader(200)

	}else {
		util.HTTPServerError(w)
		fmt.Println("no id")
		return
	}
}

func RecipeFoodIngredientDelete(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)

	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil {
			auth.ReturnUnauthorized(w)
			return
		}
		fiid := ps.ByName("fiid")
		fmt.Println("fiid:", fiid)
		_, err = statements.RecipeFoodIngredientDeleteSTMT.Exec(fiid)
		if err != nil {
			util.HTTPServerError(w)
			return
		}
		w.WriteHeader(200)

	}else {
		util.HTTPServerError(w)
		fmt.Println("no id")
		return
	}
}

func RecipeMethodStepDelete(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)
	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil {
			auth.ReturnUnauthorized(w)
			return
		}
		methodid := ps.ByName("stepid")
		_, err = statements.MethodStepDeleteSTMT.Exec(methodid)
		if err != nil {
			util.HTTPServerError(w)
			return
		}
		w.WriteHeader(200)
	}else {
		util.HTTPServerError(w)
		fmt.Println("no id")
		return
	}
}

func RecipeMethodStepCreate(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)
	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil{
			auth.ReturnUnauthorized(w)
			return
		}
		var methodStep recipes.MethodStep
		err := json.NewDecoder(r.Body).Decode(&methodStep)
		if err != nil {
			util.ReturnBadRequest(w)
			fmt.Println(err)
			return
		}
		methodStep.TimeStampAdded = time.Now()
		var methodID int64
		err = statements.MethodStepCreateSTMT.QueryRow(id, methodStep.StepDescription, methodStep.TimeStampAdded, methodStep.DurationInMinutes).Scan(&methodID)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		methodStep.ID = methodID
		jsonResponse, _ := json.Marshal(methodStep)
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResponse)
	}else {
		util.HTTPServerError(w)
		return
	}
}

func RecipeMethodStepUpdateView(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	idString := ps.ByName("id")
	id, err := getIDfromString(idString)
	if err != nil {
		util.ReturnBadRequest(w)
		fmt.Println(err)
		return
	}
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		err = checkIfRequesteeIsRecipeOwner(id, derivedID)
		if err != nil{
			auth.ReturnUnauthorized(w)
			return
		}
		var methodStep recipes.MethodStep
		err := json.NewDecoder(r.Body).Decode(&methodStep)
		methodStepID := ps.ByName("stepid")
		if err != nil {
			util.ReturnBadRequest(w)
			fmt.Println(err)
			return
		}
		_, err = statements.MethodStepUpdateSTMT.Exec(methodStep.DurationInMinutes, methodStep.StepDescription, methodStepID)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		w.WriteHeader(http.StatusOK)
	}else {
		util.HTTPServerError(w)
		return
	}
}


func RecipeIngredientDetail(w http.ResponseWriter, r *http.Request, p httprouter.Params){
	id := p.ByName("id")
	rows, err := statements.GetMiscIngFromRecipeSTMT.Query(id)
	if err != nil{
		fmt.Println(err)
		util.HTTPServerError(w)
		return
	}
	defer rows.Close()
	miscIng := recipes.IngredientsMisc{}
	for rows.Next(){
		var ing recipes.Ingredient
		err := rows.Scan(&ing.ID, &ing.Title, &ing.Amount, &ing.Measurement)		
		if err != nil{
			fmt.Println(err)
			return
		}
		miscIng = append(miscIng, ing)
	}
	response, err := json.Marshal(miscIng)
	if err !=nil{
		util.HTTPServerError(w)
		return
	}
	w.Write(response)
}

func RecipeMethodDetail(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	id := ps.ByName("id")
	rows, err := statements.GetMethodFromRecipeSTMT.Query(id)
	if err != nil{
		util.ReturnNotFound(w)
		return
	}
	defer rows.Close()
	methods:= []recipes.MethodStep{}
	for rows.Next(){
		var step recipes.MethodStep
		rows.Scan(&step.ID, &step.StepDescription, &step.TimeStampAdded, &step.DurationInMinutes)		
		methods = append(methods, step)
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


func CreateRecipeView(w http.ResponseWriter, r *http.Request, _ httprouter.Params){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
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






func UpdateRecipeView(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	 if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		
		idString := ps.ByName("id")
		id, err := getIDfromString(idString)
		if err != nil{
			util.ReturnBadRequest(w)
			fmt.Printf("error parsing id: %v\n", idString)
			return
		}
		if err = checkIfRequesteeIsRecipeOwner(id, derivedID); err != nil{
			auth.ReturnUnauthorized(w)
			return
		}
		var parsedRequest recipes.Recipe
		if err = json.NewDecoder(r.Body).Decode(&parsedRequest); err != nil{
			util.ReturnBadRequest(w)
			return
		}
		if valid := parsedRequest.IsValidForDBInsertion(); !valid{
			util.ReturnBadRequest(w)
			fmt.Println("error:", parsedRequest)
			return
		}
		_, err = db.DBCon.Exec("UPDATE recipes SET title = $1, description = $2, type_of_meal = $3, vegan = $4, vegetarian = $5, public = $6 WHERE id = $7;", parsedRequest.Title, parsedRequest.Description, parsedRequest.TypeOfMeal, parsedRequest.Vegan, parsedRequest.Vegetarian, parsedRequest.Public, id)
		if err != nil{
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		fmt.Println(parsedRequest)
		w.WriteHeader(200)

	}
}


type ImageNameResponse struct{
	Filename string
}

func RecipeBannerView(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		idstring:=ps.ByName("id")
		recipeid, err := getIDfromString(idstring)
		if err != nil{
			http.Error(w, "Unable to parse image", http.StatusBadRequest)
			defer logging.ErrorLogger(err, "routes/recipe.go", "RecipeBannerView")
			return
		}
		err = checkIfRequesteeIsRecipeOwner(recipeid, derivedID)
		if err != nil{
			auth.ReturnUnauthorized(w)
			return
		}
		r.ParseMultipartForm(10 << 20)
		file, handler, err := r.FormFile("banner")
		if err != nil{
			http.Error(w, "Unable to parse image", http.StatusBadRequest)
			defer logging.ErrorLogger(err, "routes/recipe.go", "RecipeBannerView")
			return
		}
		fmt.Println("filename", handler.Filename)
		defer file.Close()
		var image_url sql.NullString
		//Check if owner
		err = db.DBCon.QueryRow("SELECT image_url FROM recipes WHERE id = $1;", recipeid).Scan(&image_url)
		if err != nil {
			fmt.Println(err)
			util.ReturnNotFound(w)
			return
		}
		
		if image_url.Valid && image_url.String != "" {
			err = mediahandler.S3Connection.DeleteImage(image_url.String)
			if err != nil{
				util.HTTPServerError(w)
				fmt.Println(err)
				return
			}
		}
		
		filename := idstring + "_" + handler.Filename
		fmt.Println("recipeid:", recipeid)
		fmt.Printf("Uploaded File: %+v\n", filename)
    	fmt.Printf("File Size: %+v\n", handler.Size)
    	fmt.Printf("MIME Header: %+v\n", handler.Header)
		//check if recipe already has banner. if true delete image
		
		//////
		///attempt image upload
		err = mediahandler.S3Connection.StoreImage(file, filename)
		if err != nil {
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		//if succes update recipe record banner image
		//
		_, err = db.DBCon.Exec("UPDATE recipes SET image_url = $1 WHERE id = $2;", filename, recipeid)
		if err != nil{
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		w.WriteHeader(http.StatusCreated)
		resUS := ImageNameResponse{
			Filename: filename,
		}
		res, _ := json.Marshal(&resUS)
		w.Write(res)
		///////
	}
}


func GetAllFoodIngredientsView(w http.ResponseWriter, r *http.Request, _ httprouter.Params){
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
	// fmt.Println(querystring)
	stmt, err := db.DBCon.Prepare(querystring)
	if err != nil {
		logging.ErrorLogger(err, "routes/recipe.go", "GetAllFoodIngredientsView")		
		util.ReturnNotFound(w)
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



func AddToFavView(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		recipeidString:=ps.ByName("id")
		recipeid, err := getIDfromString(recipeidString)
		if err != nil{
			util.ReturnBadRequest(w)
			return 
		}
		liked, err := checkIfLikedByUser(int64(derivedID), recipeid)
		if err != nil{
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		if liked{
			util.ReturnBadRequest(w)
			return
		}
		_, err = statements.AddToFavSTMT.Exec(recipeid, derivedID)
		if err != nil {
			util.HTTPServerError(w)
			return
		}
		w.WriteHeader(200)

	} else{
		auth.ReturnUnauthorized(w)
		return
	}
	
}


func RemoveFromFavView(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		recipeidString:=ps.ByName("id")
		recipeid, err := getIDfromString(recipeidString)
		if err != nil{
			util.ReturnBadRequest(w)
			fmt.Println(err)
			return 
		}
		liked, err := checkIfLikedByUser(int64(derivedID), recipeid)
		if err != nil{
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		if liked{
			_, err = statements.RemoveFromFavSTMT.Exec(derivedID, recipeid)
			if err != nil {
				util.HTTPServerError(w)
				fmt.Println(err)
				return
			}
			w.WriteHeader(200)
			return
		} else {
			util.ReturnBadRequest(w)
			return
		}
	} else{
		auth.ReturnUnauthorized(w)
		return
	}


}

func IsLikedByUserView(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	if derivedID, ok := r.Context().Value(middleware.ContextKey).(auth.UserID); ok{
		recipeStringID := ps.ByName("id")
		recipeid, err := getIDfromString(recipeStringID)
		if err != nil{
			util.ReturnBadRequest(w)
			return 
		}
		liked, err := checkIfLikedByUser(int64(derivedID), recipeid)
		if err != nil{
			util.HTTPServerError(w)
			fmt.Println(err)
			return
		}
		if liked{
			w.WriteHeader(200)
			return
		}else{
			w.WriteHeader(404)
			return
		}

	} else{
		auth.ReturnUnauthorized(w)
		return
	}
}

type LikesStruct struct{
	Likes int64
}



func GetAllLikesFromRecipeView (w http.ResponseWriter, r *http.Request, ps httprouter.Params){
	recipeStringID := ps.ByName("id")
	recipeid, err := getIDfromString(recipeStringID)
	if err != nil{
		util.ReturnBadRequest(w)
		return 
	}
	jsonResponse, err := getAllLikesFromRecipe(recipeid)
	if err != nil {
		util.HTTPServerError(w)
		fmt.Println(err)
		return
	}
	w.Write(jsonResponse)
}