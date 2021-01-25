package helpers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/models"
	"golang.org/x/crypto/bcrypt"
)

//SigningKey is the key to encode jwt's with
var SigningKey []byte







//JWTPayload is the payload that is sent back upon a succesful authentication or user account creation
type JWTPayload struct {
	Key string
}
// Validate is  a user method to check if it's valid for registering a new user to the db

//DecodeRequestBodyIntoUser is a function that decodes a request body json into a user struct and returns it
func DecodeRequestBodyIntoUser(r *http.Request) (models.UserModel,error){
	var user models.UserModel
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

// GenerateToken is a function to generate a JWT 
func GenerateToken(userID int64) ([]byte,error){
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid": userID,
		"exp": time.Now().Add(time.Minute*15).Unix(),
		"isAdmin": false,
	})
	
	
	tokenString, err := token.SignedString(SigningKey)
	if err != nil {
		logging.ErrorLogger(err)
		return []byte(""), err
	}
	jwtpayload := JWTPayload{
		Key: tokenString,
	}
	encodedJWTPayload, _ := json.Marshal(jwtpayload)
	
	return encodedJWTPayload, nil
}


// ParseToken parses a jwt token and returns it
func ParseToken(rt string) *jwt.Token{
	token, err := jwt.Parse(rt, func(token *jwt.Token) (interface{}, error) {
		return SigningKey, nil
	})
	if err != nil{
		logging.ErrorLogger(err)
	}
	return token
}


//CheckIfNotExpired checks if a given time (jwt exp claim) has passed yet
func CheckIfNotExpired(exp time.Time) bool{
	now := time.Now().Before((exp))
	return now

}