package logging

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

//InitLogging Initializes the directory in which logfiles will be written
func InitLogging(){
	os.Mkdir("Log", 0777)
}

//Logger is a method that logs a received message to the received file
func Logger(messageString, typeOfLog, logdir string) bool{
	defer func(){
		if err := recover(); err!=nil{
			fmt.Println(err)
			fmt.Println("Recovered in logger")
		} 
	}()
	filename :=  logdir + typeOfLog + ".log"
	file, err := os.OpenFile(filename, os.O_RDWR | os.O_CREATE | os.O_APPEND, 0666)
	if err != nil{
		fmt.Println(err)
		panic(err)
	}
	defer file.Close()	
	_, err = file.WriteString(fmt.Sprintf("[%s] ", time.Now().Round(0)) + messageString + "\n")
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	return true
}
//RequestLogger is a method that formats a log message and passes it to the logger function
func RequestLogger(r *http.Request){
	messageString := fmt.Sprintf("path: %s, method: %s", r.URL.Path, r.Method)
	Logger(messageString, "requests", "./Log/")
}

//ErrorLogger is a method to format error messages and sends them to the logger function to be written in the logfile
func ErrorLogger(err error, filename, function string){
	Logger("ERROR: " + err.Error() + fmt.Sprintf(". File: %s, in: %s", filename, function), "errors", "./Log/")
}

//HandleServerError is a function that handles errors that shouldn't happen. This excludes errors that happen because of faulty user input
// func HandleServerError(err error) {
// 		if err != nil{
// 			if os.Getenv("MODE") == "development"{
// 				fmt.Println(err)
// 			}
// 			ErrorLogger(err)
// 			panic(err)
// 		}
// }