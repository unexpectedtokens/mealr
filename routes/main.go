package routes

import "fmt"





func PrepareStatements() error{
	err := prepareRecipeStatements()
	if err != nil {
		return fmt.Errorf("error preparing recipestatements: %s", err.Error())
	}
	return nil
}