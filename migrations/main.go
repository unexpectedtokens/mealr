package migrations

import (
	"fmt"
	"io/ioutil"

	db "github.com/unexpectedtokens/mealr/database"
	"github.com/unexpectedtokens/mealr/logging"
)

//RunMigrations runs the migrations in the migrations.sql file
func RunMigrations(filename string) error{
	defer func(){
		if r := recover(); r !=nil{
			fmt.Println(r)
		}
	}()
	
	db.InitDB()
	defer db.DBCon.Close()
	file, err := ioutil.ReadFile(fmt.Sprintf("migrations/migration_files/%s.sql", filename))
	if err != nil{
		panic(err)

	}
	fmt.Printf("Running migrations from %s\n", filename)
	_, err = db.DBCon.Exec(string(file))
	if err != nil {
		logging.ErrorLogger(err, "migrations/main.go", "RunMigrations")
		panic(fmt.Errorf("error migrating: %s", err.Error()))
	}
	fmt.Println("[SUCCES]: Migrations ran succesfully")
	return nil
}

//Flush deletes all tables from postgres
func Flush(){
	query := "DROP TABLE users CASCADE; DROP TABLE profiles; DROP TABLE jwt_auth; DROP TABLE recipes CASCADE; DROP TABLE ingredients_from_recipe; DROP TABLE methods_from_recipe; DROP TABLE food_ingredient CASCADE; DROP TABLE ingredients_from_foodingredient_from_recipe; DROP TABLE favourite_recipes; DROP TABLE notes_from_recipes;"
	db.InitDB()
	defer db.DBCon.Close()
	_, err := db.DBCon.Exec(query)
	if err != nil{
		panic(err)
	}
	fmt.Println("[SUCCES]: Flush ran succesfully")
}