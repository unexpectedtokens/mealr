package server

import (
	"fmt"
	"html/template"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/rs/cors"
	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/routes"
)


type middlewareFunc func(httprouter.Handle) httprouter.Handle

var commonMiddleware []middlewareFunc
func init(){
	commonMiddleware = []middlewareFunc{
		middleware.LoggingMiddleware,
	}
}


func applyMiddleware(h httprouter.Handle, m ...middlewareFunc) httprouter.Handle{	
	wrapped := h
	middlewareList := append(commonMiddleware, m...)
	for i := len(middlewareList) - 1; i >= 0; i--{
		wrapped = middlewareList[i](wrapped)
	}
	return wrapped	
}


//ALWAYS put in AuthorizeMiddleware last if you need the (user)id in the handler function. An option is to wrap the actual handler function with auth middleware before passing it to applyMiddleware
func handleRequests(){
	router := httprouter.New()
	//RECIPE RELATED
	router.GET("/api/recipes/listall/", applyMiddleware(routes.AllRecipes, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/detail/:id/mi/", applyMiddleware(routes.RecipeIngredientDetail))
	router.POST("/api/recipes/detail/:id/mi", applyMiddleware(routes.RecipeMiscIngredientCreate, middleware.AuthorizeMiddleware))
	router.DELETE("/api/recipes/detail/:id/deletemi/:miid", applyMiddleware(routes.RecipeMiscIngredientDelete, middleware.AuthorizeMiddleware))
	router.DELETE("/api/recipes/detail/:id/deletefi/:fiid", applyMiddleware(routes.RecipeFoodIngredientDelete, middleware.AuthorizeMiddleware))
	router.DELETE("/api/recipes/detail/:id/method/:stepid", applyMiddleware(routes.RecipeMethodStepDelete, middleware.AuthorizeMiddleware))
	router.PATCH("/api/recipes/detail/:id/method/:stepid", applyMiddleware(routes.RecipeMethodStepUpdateView, middleware.AuthorizeMiddleware))
	router.POST("/api/recipes/detail/:id/fi", applyMiddleware(routes.RecipeFoodIngredientCreate, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/detail/:id/fi/", applyMiddleware(routes.RecipeFoodIngredientDetail))
	router.GET("/api/recipes/detail/:id/method/", applyMiddleware(routes.RecipeMethodDetail))
	router.POST("/api/recipes/detail/:id/method/", applyMiddleware(routes.RecipeMethodStepCreate, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/listfav/", applyMiddleware(routes.FetchFavouriteRecipes, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/listmine/", applyMiddleware(routes.MyRecipes, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/detail/:id", applyMiddleware(routes.RecipeDetail))
	router.PATCH("/api/recipes/detail/:id", applyMiddleware(routes.UpdateRecipeView, middleware.AuthorizeMiddleware))
	router.POST("/api/recipes/create/", applyMiddleware(routes.CreateRecipeView, middleware.AuthorizeMiddleware))
	router.POST("/api/recipes/detail/:id/addbanner/", applyMiddleware(routes.RecipeBannerView, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/allingredients/", applyMiddleware(routes.GetAllFoodIngredientsView))
	router.POST("/api/recipes/like/:id", applyMiddleware(routes.AddToFavView, middleware.AuthorizeMiddleware))
	router.DELETE("/api/recipes/like/:id", applyMiddleware(routes.RemoveFromFavView, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/likedbyuser/:id", applyMiddleware(routes.IsLikedByUserView, middleware.AuthorizeMiddleware))
	router.GET("/api/recipes/detail/:id/likes", applyMiddleware(routes.GetAllLikesFromRecipeView))

	//AUTH RELATED
	router.POST("/auth/create/", applyMiddleware(routes.RegisterView))
	router.POST("/auth/obtain/", applyMiddleware(routes.LoginView))
	router.GET("/auth/retrieve/", applyMiddleware(routes.GetUserView, middleware.AuthorizeMiddleware))
	// router.GET("/auth/update/", applyMiddleware(middleware.AuthorizeMiddleware(routes.ChangeUserView)))
	router.POST("/auth/refresh/", applyMiddleware(routes.RefreshView))
	router.GET("/auth/logout/", applyMiddleware(routes.LogOutView))

	//MEALPLAN RELATED
	// router.GET("/api/mealplan/get/", applyMiddleware(routes.PlanGet, middleware.AuthorizeMiddleware))
	// router.GET("/api/mealplan/generate/", applyMiddleware(routes.GeneratePlanView, middleware.AuthorizeMiddleware))

	//PROFILE RELATED
	router.GET("/api/profile/getactivityoptions/", applyMiddleware(routes.ActivityOptionsView))
	router.GET("/api/profile/", applyMiddleware(routes.GetProfileView, middleware.AuthorizeMiddleware))
	router.PUT("/api/profile/update/", applyMiddleware(routes.UpdateProfileView, middleware.AuthorizeMiddleware))
	router.GET("/api/profile/isvalid/", applyMiddleware(routes.ProfileValidForMealPlanGeneratorView, middleware.AuthorizeMiddleware))
	router.GET("/site/*path", serveSPA)
	router.NotFound = http.FileServer(http.Dir("./client/build"))
	router.GET("/ws_test", routes.MealPlanConnect)
	//CORS SETTINGS
	_cors := cors.Options{
        AllowedMethods: []string{"POST", "OPTIONS", "GET", "PUT", "UPDATE", "PATCH", "HEAD", "DELETE"},
        AllowedOrigins: []string{"*"},
		AllowedHeaders: []string{"*"},
    }
	//"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    handler := cors.New(_cors).Handler(router)

	fmt.Println("Setting op listening on port 8080")
	
	panic(http.ListenAndServe("localhost:8080", handler))
}

func serveSPA(w http.ResponseWriter, r *http.Request, _ httprouter.Params){
	app := template.Must(template.ParseFiles("./client/build/index.html"))
	app.Execute(w, nil)
}



//HTTPServer starts the server to receive requests on the specified port
func HTTPServer(){
	db.InitDB()
	err := routes.PrepareStatements()
	if err != nil{
		panic(err)
	}
	fmt.Println("Succesfully prepared statements")
	defer db.DBCon.Close()
	go auth.TokenCleanup()
	handleRequests()	
}



