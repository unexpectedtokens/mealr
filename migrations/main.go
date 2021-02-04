package migrations

import (
	"fmt"
	"io/ioutil"

	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
)

//RunMigrations runs the migrations in the migrations.sql file
func RunMigrations() error{
	defer func(){
		if r := recover(); r !=nil{
			fmt.Println(r)
		}
	}()
	db.InitDB()
	file, err := ioutil.ReadFile("migrations/migrations.sql")
	if err != nil{
		panic(err)

	}
	_, err = db.DBCon.Exec(string(file))
	if err != nil {
		logging.ErrorLogger(err)
		return err
	}
	fmt.Println("[SUCCES]: Migrations ran succesfully")
	return nil
}