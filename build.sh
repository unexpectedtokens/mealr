#This file contains the steps which are needed to deploy this application
#moves into the client directory where the react client resides and builds it
cd client && npm run build

#moves back into the main directory and compiles the golang backend to binary
cd ..
go build cmd/main.go
#runs the binary file which will setup a database connection and a http server listener
./main