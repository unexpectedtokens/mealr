package models

//Model represents methods that every model should have
type Model interface{
	Save()
	Retrieve()
}