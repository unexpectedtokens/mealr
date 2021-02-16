package middleware

import (
	"net/http"

	"github.com/unexpectedtokens/mealr/logging"
)

//LoggingMiddleware Logs all requests to the requests.log file
func LoggingMiddleware(h http.HandlerFunc) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		logging.RequestLogger(r)
		h.ServeHTTP(w, r)
	}
}