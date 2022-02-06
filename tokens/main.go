package tokens

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/unexpectedtokens/mealr/auth"
	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/util"
)

//AuthToken is returned to the user that is trying to log in
type AuthToken string

type RefreshToken struct {
	ID        int64
	ExpiresAt time.Time
	UserID    auth.UserID
	Token     AuthToken
}

var TokenBlackList *[]AuthToken = &[]AuthToken{}

const TokenExpiration time.Duration = time.Hour * 3

//createExpiredAt returns the current time + 7 days
func createExpiredAt() time.Time {
	return time.Now().Add(time.Hour * 24 * 7).UTC()
}

// Store stores a refreshtoken in the database
func (a AuthToken) Store(id auth.UserID) error {
	expiresAt := createExpiredAt()
	stmt, err := db.DBCon.Prepare("INSERT INTO jwt_auth (user_id, token, expires_at) VALUES($1, $2, $3);")
	if err != nil {
		return err
	}
	_, err = stmt.Exec(id, a, expiresAt)
	if err != nil {
		return err
	}
	return nil
}

func GetToken(token AuthToken) (RefreshToken, error) {
	rt := RefreshToken{}
	stmt, err := db.DBCon.Prepare("SELECT id, expires_at, token, user_id FROM jwt_auth WHERE token = $1;")
	if err != nil {
		return rt, fmt.Errorf("error setting up query-statement: %s", err.Error())
	}

	err = stmt.QueryRow(token).Scan(&rt.ID, &rt.ExpiresAt, &rt.Token, &rt.UserID)
	if err != nil {
		return rt, fmt.Errorf("something went wrong scanning rows: %s", err.Error())
	}
	return rt, nil
}

func (r RefreshToken) CheckValidForRefresh() bool {
	return time.Now().Before(r.ExpiresAt)
}

//CheckValidForExtension checks if a token row in the db is valid for extension.
func (r RefreshToken) Refresh() error {
	stmt, err := db.DBCon.Prepare("UPDATE jwt_auth SET token = $1, expires_at = $2 WHERE id = $3")
	if err != nil {
		return err
	}
	_, err = stmt.Exec(r.Token, createExpiredAt(), r.ID)
	if err != nil {
		return err
	}
	return nil
}

func (r RefreshToken) Delete() error {
	stmt, err := db.DBCon.Prepare("DELETE FROM jwt_auth WHERE token = $1;")
	if err != nil {
		return err
	}
	_, err = stmt.Exec(r.Token)
	if err != nil {
		return err
	}
	return nil
}

//Log in/register: token is stored in the db
//Refresh: expired token is sent, check in db if token is valid for extension.
//If true token is renewed and saved in row and expires at is reset

// GenerateTokenPair is a function to generate a JWT
func GenerateToken(userID auth.UserID) (AuthToken, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid":     userID,
		"exp":     time.Now().Add(TokenExpiration).Unix(),
		"isAdmin": false,
	})
	tokenString, err := token.SignedString(util.SigningKey)
	if err != nil {
		return "", err
	}
	return AuthToken(tokenString), nil
}

// ParseToken parses a jwt token and returns it
func parseToken(rt string) (*jwt.Token, error) {
	token, err := jwt.Parse(rt, func(token *jwt.Token) (interface{}, error) {
		return util.SigningKey, nil
	})
	if err != nil {
		return &jwt.Token{}, err
	}
	return token, nil
}

type NotAbleToGetDataErr struct {
	err string
}

func (n NotAbleToGetDataErr) Error() string {
	return n.err
}

func getDataFromToken(token *jwt.Token) (float64, time.Time, error) {
	var tm time.Time
	var uid float64
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		switch exp := claims["exp"].(type) {
		case float64:
			fmt.Println("its a float")
			tm = time.Unix(int64(exp), 0)
		case json.Number:
			fmt.Println("its a json number")
			v, _ := exp.Int64()
			tm = time.Unix(v, 0)
		}
		var ok bool
		if uid, ok = claims["uid"].(float64); ok {
			return uid, tm, nil
		}
	}
	return 0, time.Time{}, NotAbleToGetDataErr{
		err: "Unable to get data",
	}
}

func CheckIfAuth(tokenString string) (float64, bool) {
	token, err := parseToken(tokenString)
	if err != nil {

		return 0, false
	}
	uid, tm, err := getDataFromToken(token)
	if err != nil {
		return 0, false
	}
	if checkIfNotExpired(tm) {
		return uid, true
	} else {

		return 0, false
	}

}

//checkIfNotExpired checks if a given time (jwt exp claim) has passed yet
func checkIfNotExpired(exp time.Time) bool {
	return time.Now().Before((exp))
}

var removalMutex = sync.Mutex{}

func removeFromBlackList(token AuthToken) {
	removalMutex.Lock()
	defer removalMutex.Unlock()
	var index int
	for i, x := range *TokenBlackList {
		if x == token {
			index = i
			break
		}
	}
	newList := *TokenBlackList
	newList = append(newList[:index], newList[index+1:]...)
	TokenBlackList = &newList
}

var blacklistMutex = sync.Mutex{}

func AddToTokenBlacklist(token AuthToken) {
	blacklistMutex.Lock()
	*TokenBlackList = append(*TokenBlackList, token)
	blacklistMutex.Unlock()

	go func() {
		time.Sleep(TokenExpiration)
		removeFromBlackList(token)
	}()
}
