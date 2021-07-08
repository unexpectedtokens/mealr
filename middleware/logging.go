package middleware

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/unexpectedtokens/mealr/logging"
)

//LoggingMiddleware Logs all requests to the requests.log file
func LoggingMiddleware(h httprouter.Handle) httprouter.Handle{
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params){
		logging.RequestLogger(r)
		h(w, r, ps)
	}
}