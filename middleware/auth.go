package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/models"
)

//AuthorizeMiddleware checks for a valid jwt and passes the id unto the view
func AuthorizeMiddleware(next http.HandlerFunc) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		if len(r.Header["Authorization"]) == 0 {
			auth.ReturnUnauthorized(w)
			return
		}	
		token := auth.ParseToken(r.Header["Authorization"][0])
		if claims, ok := token.Claims.(jwt.MapClaims); ok{

			var tm time.Time
    		switch exp := claims["exp"].(type) {
    		case float64:
        		tm = time.Unix(int64(exp), 0)
    		case json.Number:
        		v, _ := exp.Int64()
        		tm = time.Unix(v, 0)
    		}

			if UID, ok := claims["uid"].(float64); ok{
				if auth.CheckIfNotExpired(tm){
					fmt.Println(UID)
					ctx := context.WithValue(r.Context(), w, models.UserID(int64(UID)))
					next.ServeHTTP(w, r.WithContext(ctx))
				}else{
					auth.ReturnUnauthorized(w)
				}
			}else{
				auth.ReturnUnauthorized(w)
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