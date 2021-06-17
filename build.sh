#This file contains the steps which are needed to deploy this application
#moves into the client directory where the react client resides and builds it
cd client
npm install
npm run build
rm -rf node_modules
#moves back into the main directory and compiles the golang backend to binary
cd ..
go build cmd/main.go
docker build -t lembas .





# app -------> server
# server -------> app een token
# app refresh please my token