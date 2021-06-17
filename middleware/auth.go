package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/tokens"
)

type contextKey string

//ContextKey is used to get the user from context
const ContextKey contextKey = "user"
//AuthorizeMiddleware checks for a valid jwt and passes the id unto the view
func AuthorizeMiddleware(next http.HandlerFunc) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		if len(r.Header["Authorization"]) == 0 {
			auth.ReturnUnauthorized(w)
			return
		}	
		token, err := tokens.ParseToken(r.Header["Authorization"][0])
		if (err != nil) {
			auth.ReturnUnauthorized(w)
			return
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok{
			err := claims.Valid()
			if err != nil{
				auth.ReturnUnauthorized(w)
				return
			}
			var tm time.Time
    		switch exp := claims["exp"].(type) {
    		case float64:
        		tm = time.Unix(int64(exp), 0)
    		case json.Number:
        		v, _ := exp.Int64()
        		tm = time.Unix(v, 0)
    		}

			if UID, ok := claims["uid"].(float64); ok{
				if tokens.CheckIfNotExpired(tm){
					ctx := context.WithValue(r.Context(), ContextKey, auth.UserID(int64(UID)))
					next.ServeHTTP(w, r.WithContext(ctx))
				}else{
					auth.ReturnUnauthorized(w)
					return
				}
			}else{
				auth.ReturnUnauthorized(w)
				return
			}
		} else {
			auth.ReturnUnauthorized(w)
			return
		}
	}
}