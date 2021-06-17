FROM golang:1.14

WORKDIR /go/src/app
COPY . .
RUN go get -d -v ./...
RUN go install -v ./...
RUN go build ./cmd/main.go
EXPOSE 8080
CMD ["./main"]