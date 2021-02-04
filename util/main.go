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