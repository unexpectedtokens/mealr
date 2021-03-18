package util

import "net/http"

// CheckIfMethodAllowed checks if a certain method is allowed
func CheckIfMethodAllowed(w http.ResponseWriter,r *http.Request, methAll []string) (con bool){
	for _, x := range methAll{
		if x == r.Method{
			con = true
			break
		}
	}
	if !con{
		HTTPErrorWrongMethod(w)
	}
	return con
}


//HTTPErrorWrongMethod returns an status not allowed header when the http header is not allowed for the specific
func HTTPErrorWrongMethod(w http.ResponseWriter){
	http.Error(w, "", http.StatusMethodNotAllowed)
}

//HTTPServerError returns a status code 500 on an error
func HTTPServerError(w http.ResponseWriter){
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}


//ReturnBadRequest returns a 400 bad request status code
func ReturnBadRequest(w http.ResponseWriter){
	http.Error(w, "bad request", http.StatusBadRequest)
}

func ReturnNotFound(w http.ResponseWriter){
	http.Error(w, "Not Found", http.StatusNotFound)
}