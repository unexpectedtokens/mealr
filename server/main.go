package server

import (
	"fmt"
	"net/http"

	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/routes"
)


type middlewareFunc func(http.HandlerFunc) http.HandlerFunc

var commonMiddleware []middlewareFunc
func init(){

	commonMiddleware = []middlewareFunc{
		middleware.LoggingMiddleware,
	}
	

}


func applyMiddleware(h http.HandlerFunc, m ...middlewareFunc) http.HandlerFunc{
		if len(m) < 1{
			return middleware.AllowCORSMiddleware(h) 
		}
		wrapped := h
		middlewareList := append(commonMiddleware, m...)
		for i := len(middlewareList) - 1; i >= 0; i--{
			wrapped = middlewareList[i](wrapped)
		}
		wrapped = middleware.AllowCORSMiddleware(wrapped)
		return wrapped	
}


//ALWAYS put in AuthorizeMiddleware last if you need the id in the handler function. An option is to wrap the actual handler function with auth middleware before passing it to applyMiddleware

func handleRequests(){
	http.HandleFunc("/auth/create/", applyMiddleware(routes.RegisterView))
	http.HandleFunc("/auth/obtain/", applyMiddleware(routes.LoginView))
	http.HandleFunc("/auth/retrieve/", applyMiddleware(routes.GetUserView, middleware.AuthorizeMiddleware))
	// http.HandleFunc("/auth/update/", applyMiddleware(middleware.AuthorizeMiddleware(routes.ChangeUserView)))
	http.HandleFunc("/auth/refresh/", applyMiddleware(routes.RefreshView))
	http.HandleFunc("/auth/logout/", applyMiddleware(routes.LogOutView))
	// http.HandleFunc("/api/mealplan/get/", applyMiddleware(routes.PlanGet, middleware.AuthorizeMiddleware))
	// http.HandleFunc("/api/mealplan/generate/", applyMiddleware(routes.GeneratePlanView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/profile/getactivityoptions/", applyMiddleware(routes.ActivityOptionsView))
	http.HandleFunc("/api/profile/", applyMiddleware(routes.GetProfileView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/profile/update/", applyMiddleware(routes.UpdateProfileView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/profile/isvalid/", applyMiddleware(routes.ProfileValidForMealPlanGeneratorView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/recipes/listall/", applyMiddleware(routes.AllRecipes))
	http.HandleFunc("/api/recipes/listfav/", applyMiddleware(routes.FetchFavouriteRecipes, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/recipes/listmine/", applyMiddleware(routes.MyRecipes, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/recipes/detail/", applyMiddleware(routes.RecipeDetail))
	http.HandleFunc("/api/recipes/create/", applyMiddleware(routes.CreateRecipeView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/recipes/addbanner/", applyMiddleware(routes.RecipeBannerView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/api/recipes/allingredients/", applyMiddleware(routes.GetAllFoodIngredientsView))
	http.HandleFunc("/site/", middleware.LoggingMiddleware(serveSPA))
	buildHandler := http.FileServer(http.Dir("client/build"))
	http.Handle("/", buildHandler)
	fmt.Println("Setting op listening on port 8080")
	panic(http.ListenAndServe("localhost:8080", nil))
}

func serveSPA(w http.ResponseWriter, r *http.Request){
	http.ServeFile(w, r, "client/build/index.html")
}



//HTTPServer starts the server to receive requests on the specified port
func HTTPServer(){
	db.InitDB()
	defer db.DBCon.Close()
	go auth.TokenCleanup()
	handleRequests()	
}