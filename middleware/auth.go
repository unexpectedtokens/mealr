package middleware

import (
	"context"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/tokens"
)

type contextKey string

//ContextKey is used to get the user from context
const ContextKey contextKey = "user"

//AuthorizeMiddleware checks for a valid jwt and passes the id unto the view
func AuthorizeMiddleware(next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		if len(r.Header["Authorization"]) == 0 {
			auth.ReturnUnauthorized(w)
			return
		}

		if uid, authenticated := tokens.CheckIfAuth(r.Header["Authorization"][0]); authenticated {
			ctx := context.WithValue(r.Context(), ContextKey, auth.UserID(int64(uid)))

			next(w, r.WithContext(ctx), ps)
		} else {
			auth.ReturnUnauthorized(w)
			return
		}
	}
}
