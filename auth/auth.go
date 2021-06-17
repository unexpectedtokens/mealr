package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
	"golang.org/x/crypto/bcrypt"
)

// UserModel is the model that is to be used for users througout the application
type UserModel struct {
	ID UserID			`json:"id,omitempty" sql:"id"` 
	Username string 	`json:"username,omitempty"`
	Email string		`json:"email,omitempty"`
	Password string		`json:"password,omitempty"`
}

//UserID is the type to hold userid's
type UserID int64

//Validate validates a users input in the register view
func (u *UserModel) Validate() bool{
	valid := true
	if valid = u.Email != "" && valid; !valid{
		return false
	}
	if valid = u.Username != "" && valid; !valid{
		return false
	}
	if valid = u.Password != "" && valid; !valid{
		return false
	}
	return valid
}


//CheckIfExists checks if a user exists in the database
func(u *UserModel) CheckIfExists() (string, bool, error){
	stmtUsername, err :=db.DBCon.Prepare("SELECT id FROM users WHERE username=$1;")
	if err != nil {
		return "", true, err
	}
	stmtEmail, err := db.DBCon.Prepare("SELECT id FROM users WHERE email=$1;")
	if err!=nil{
		return "", true, err
	}
	var idUsername int
	var idEmail int
	stmtUsername.QueryRow(u.Email, u.Username).Scan(&idUsername)
	stmtEmail.QueryRow(u.Email).Scan(&idEmail)
	if idUsername > 0{
		return "username", true, nil
	}
	if idEmail > 0{
		return "email", true, nil
	}
	return "", false, nil
}


//Save is a method to save a user model into the database
func (u *UserModel) Save(newUser bool) (UserID, error){
	var query string
	if !newUser {
		fmt.Println("updating a user")
		if u.ID > 0{
			query = "UPDATE users SET username=$1, password=$2 WHERE id=$3;"
			_, err := db.DBCon.Query(query, u.Username, u.Password, u.ID)
			if err != nil{
				return 0, err
			}
			return u.ID, nil
		}
		return 0, errors.New("id needs to be specified")
	} 
	fmt.Println("Creating a new user")
	query = "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id;"
	var id UserID
	row:= db.DBCon.QueryRow(query, u.Email, u.Username, u.Password)
	row.Scan(&id)
	return id, nil
}

//Retrieve retrieves a user instance from the database
func (u *UserModel) Retrieve() error{
	stmt, err := db.DBCon.Prepare("SELECT username, email FROM users WHERE id=$1")
	if err !=nil{
		return err
	}
	err = stmt.QueryRow(u.ID).Scan(&u.Username, &u.Email)
	if err !=nil {
		return err
	}
	return nil
}


// Validate is  a user method to check if it's valid for registering a new user to the db



//ReturnUnauthorized returns a 401 unauthorized status code
func ReturnUnauthorized(w http.ResponseWriter){
	http.Error(w, "unauthorized", http.StatusUnauthorized)
}




//DecodeRequestBodyIntoUser is a function that decodes a request body json into a user struct and returns it
func DecodeRequestBodyIntoUser(r *http.Request) (UserModel, error){
	var user UserModel
	err := json.NewDecoder(r.Body).Decode(&user)
	return user, err
}


//HashPassword is function to encrypt passwords
func HashPassword(password string) (string, error){
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}
//ComparePasswords is a function to compare password hash with entered login password
func ComparePasswords(password, hash string) bool{
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}



//DeriveUserFromReqID retrieves a user id from the db to check if it exists and then returns it
func DeriveUserFromReqID(id UserID) (UserID, error){
	user := UserModel{}	
	if user.ID == 0{
		return 0, fmt.Errorf("no such user with id %d", id)
	}
	return user.ID, nil
}


func TokenCleanup(){
	for{
		fmt.Println("Cleaning up expired tokens...")
		_, err := db.DBCon.Exec("DELETE FROM jwt_auth WHERE expires_at <= now();")
		if err != nil{
			logging.ErrorLogger(fmt.Errorf("something went wrong cleaning up expired auth tokens: %s", err.Error()), "auth.go", "TokenCleanup")
		}
		fmt.Println("Done")
		time.Sleep(time.Minute*15)
	}
}