package main

import (
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/unexpectedtokens/mealr/auth"
	"github.com/unexpectedtokens/mealr/logging"

	"github.com/unexpectedtokens/mealr/migrations"
	"github.com/unexpectedtokens/mealr/server"
)


func main(){
	logging.InitLogging()
	err := godotenv.Load()
	if err != nil{
		panic(err)
	}
	auth.SigningKey = []byte(os.Getenv("JWT_SECRET"))
	if len(os.Args) > 1{
		switch os.Args[1]{
		case "migrate":
			migrations.RunMigrations()
		case "runserver":
			server.HTTPServer()
		case "test":
		}
	}else{
		server.HTTPServer()
	}

	// err = migrations.RunMigrations()
	// if err == nil{
	// 	fmt.Println("ran migrations")
	// }
	// bmr := calories.CalculateBMR(23, 155.0,50.0,"female")
	// fmt.Println("bmr",bmr)
	// fmt.Println("tdee",calories.CalculateTDEE(bmr, "light") - 250)
}

