package main

import (
	"flag"
	"fmt"
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

var migrationFileName = flag.String("filename", "initial_migration", "name of the specific file to parse for migration")

func main() {
	fmt.Println(21 << 20)
	logging.InitLogging()

	mode := os.Getenv("MODE")

	if mode == "development" {
		err := godotenv.Load("local.env")
		if err != nil {
			panic(err)
		}
	} else if mode == "staging" {
		err := godotenv.Load("production.env")
		if err != nil {
			panic(err)
		}
	}

	err := mediahandler.InitiateConn(mediahandler.S3Config{
		Region:     os.Getenv("AWS_REGION"),
		AKID:       os.Getenv("AWS_AKI"),
		SAK:        os.Getenv("AWS_SAK"),
		BucketName: "lembasbucket",
	})
	if err != nil {
		panic(err)
	}
	err = mediahandler.S3Connection.CreateBucketIfNotExist()
	if err != nil {
		panic(err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	addr := fmt.Sprintf(":%s", port)
	fmt.Println("Succesfully connected to bucket")
	flag.Parse()
	util.SigningKey = []byte(os.Getenv("JWT_SECRET"))
	if len(os.Args) > 1 {
		for _, x := range os.Args {
			if x == "flush" {
				migrations.Flush()
			}
			if x == "migrate" {
				migrations.RunMigrations(*migrationFileName)
			}
			if x == "scrape" {
				//scraper.CollectRecipesBBC()
				//scraper.CollectRecipesEYS()
				scraper.CollectIngredients()
			}
			if x == "runserver" {
				server.HTTPServer(addr)
			}
		}
	} else {
		server.HTTPServer(addr)
	}
}
