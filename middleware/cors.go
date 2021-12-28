package middleware

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)


func setupCORS(w *http.ResponseWriter){
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

//AllowCORSMiddleware handles corssetup
func AllowCORSMiddleware (fn httprouter.Handle) httprouter.Handle{
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
		setupCORS(&w)
		if r.Method == "OPTIONS"{
			w.WriteHeader(http.StatusOK)
			return
		}
		fn(w, r, ps)
	}
}

