package middleware

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/unexpectedtokens/mealr/helpers"
)

//AuthorizeMiddleware checks for a valid jwt and passes the id unto the view
func AuthorizeMiddleware(fn func(http.ResponseWriter, *http.Request, interface{})) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		if len(r.Header["Authorization"]) == 0 {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}	
		token := helpers.ParseToken(r.Header["Authorization"][0])
		if claims, ok := token.Claims.(jwt.MapClaims); ok{

			var tm time.Time
    		switch exp := claims["exp"].(type) {
    		case float64:
        		tm = time.Unix(int64(exp), 0)
    		case json.Number:
        		v, _ := exp.Int64()
        		tm = time.Unix(v, 0)
    		}
			if helpers.CheckIfNotExpired(tm){
				fn(w,r, claims["uid"])
			}else{
				http.Error(w, "unauthorized", http.StatusUnauthorized)
		}
		}
		// if err != nil{
		// 	http.Error(w, "unauthorized", http.StatusUnauthorized)
		// }
		//else{
		// 		http.Error(w,"unauthorized", http.StatusUnauthorized)
		// 	}
		// }
	}
}