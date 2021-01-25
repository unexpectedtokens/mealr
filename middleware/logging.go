package middleware

import (
	"net/http"

	"github.com/unexpectedtokens/mealr/logging"
)

//LoggingMiddleware Logs all requests to the requests.log file
func LoggingMiddleware(fn func(http.ResponseWriter, *http.Request)) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request){
		logging.RequestLogger(r)
		fn(w, r)
	}
}