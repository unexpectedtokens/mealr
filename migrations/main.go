package migrations

import (
	"fmt"
	"io/ioutil"

	db "github.com/unexpectedtokens/mealr/database"
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
	fmt.Println(string(file))
	_, err = db.DBCon.Exec(string(file))
	if err != nil {
		return err
	}
	return nil
}