package models

//Recipe is a representation of a recipe in the database. It is used in the scraper and in the auth routes
type Recipe struct{
		ID int64
		Title string
		Source string
		SourceURL string
		ImageURL string
		Ingredients []string
		Method []string
		PrepTime string
		CookingTime string
		Serves int
		CalsProvided bool
		CalsPerServing int
		Vegetarian bool
		Vegan bool
}

//AllRecipeData if the form in which the recipe list is represented
type AllRecipeData struct{
	ID int64
	Title string
	Source string
	ImageURL string
}

//IsValidForDBInsertion checks if a scraped recipe is populated enough to be added to the db
func (c *Recipe) IsValidForDBInsertion() (valid bool) {
	valid = true
	valid = c.Title != "" && valid
	valid = len(c.Ingredients) > 0 && valid
	valid = len(c.Method) > 0 && valid
	return valid
}