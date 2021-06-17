package main

import (
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/unexpectedtokens/mealr/logging"
	"github.com/unexpectedtokens/mealr/mediahandler"
	"github.com/unexpectedtokens/mealr/migrations"
	"github.com/unexpectedtokens/mealr/scraper"
	"github.com/unexpectedtokens/mealr/server"
	"github.com/unexpectedtokens/mealr/util"
)



func main(){
	mediahandler.CheckIfDirsExistOrCreate()
	logging.InitLogging()
	err := godotenv.Load()
	if err != nil{
		panic(err)
	}
	util.SigningKey = []byte(os.Getenv("JWT_SECRET"))
	if len(os.Args) > 1{
		for _, x := range os.Args{
			if x == "flush"{
				migrations.Flush()
			}
			if x == "migrate"{
				migrations.RunMigrations()
			}
			if x == "scrape"{
				//scraper.CollectRecipesBBC()
				//scraper.CollectRecipesEYS()
				scraper.CollectIngredients()
			}
			if x == "runserver"{
				server.HTTPServer()
			}
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

