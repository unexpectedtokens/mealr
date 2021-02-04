package server

import (
	"fmt"
	"net/http"
	"os"

	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/middleware"
	"github.com/unexpectedtokens/mealr/routes"
)

func handleRequests(){
	http.HandleFunc("/auth/create/", middleware.LoggingMiddleware(routes.RegisterView))
	http.HandleFunc("/auth/obtain/", middleware.LoggingMiddleware(routes.LoginView))
	http.HandleFunc("/auth/update/", middleware.LoggingMiddleware(middleware.AuthorizeMiddleware(routes.ChangeUserView)))
	http.HandleFunc("/auth/refresh/", middleware.LoggingMiddleware(middleware.AuthorizeMiddleware(routes.RefreshView)))
	http.HandleFunc("/api/recipe/", middleware.LoggingMiddleware(routes.GeneratePlanView))
	fmt.Println("Setting op listening on port 8080")
	panic(http.ListenAndServe("localhost:8080", nil))
}

func recipesExist() bool {
	if _, err := os.Stat("./recipes.json"); os.IsNotExist(err) {
		return false
	}
	return true

}

//HTTPServer starts the server to receive requests on the specified port
func HTTPServer(){
	db.InitDB()
	routes.PopulateRecipes(recipesExist())
	defer db.DBCon.Close()
	handleRequests()	
}