package server

import (
	"fmt"
	"net/http"
	"os"

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
		//middlewareExtended := append(commonMiddleware, m...)
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
	// http.HandleFunc("/auth/update/", applyMiddleware(middleware.AuthorizeMiddleware(routes.ChangeUserView)))
	// http.HandleFunc("/auth/refresh/", applyMiddleware(middleware.AuthorizeMiddleware(routes.RefreshView)))
	http.HandleFunc("/api/generateplan/", applyMiddleware(routes.GeneratePlanView))
	http.HandleFunc("/api/profile/update/", applyMiddleware(routes.UpdateProfileView, middleware.AuthorizeMiddleware))
	http.HandleFunc("/site/", middleware.LoggingMiddleware(serveSPA))
	buildHandler := http.FileServer(http.Dir("client/build"))
	http.Handle("/", buildHandler)
	fmt.Println("Setting op listening on port 8080")
	panic(http.ListenAndServe("localhost:8080", nil))
}

func serveSPA(w http.ResponseWriter, r *http.Request){
	http.ServeFile(w, r, "client/build/index.html")
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