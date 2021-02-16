package middleware

import (
	"net/http"
)


func setupCORS(w *http.ResponseWriter){
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

//AllowCORSMiddleware handles corssetup
func AllowCORSMiddleware (fn http.HandlerFunc) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		setupCORS(&w)
		if r.Method == "OPTIONS"{
			return
		}
		fn.ServeHTTP(w, r)
	}
}

