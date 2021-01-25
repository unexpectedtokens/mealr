package calories

//BMR is the basal metabolic rate. The amount of calories a person would burn in a day if inactive for that entire day.
type BMR int

var activity map[string]float64 = map[string]float64{
	"sedentary": 1.2,
	"light": 1.375,
	"moderate": 1.55,
	"very": 1.725,
	"extreme": 1.9,
}
//CalculateBMR calculates the basal metabolic rate
func CalculateBMR(age int64, height, weight float64, gender string) int{
	// For men:
	// BMR = 10W + 6.25H - 5A + 5
	// For women:
	// BMR = 10W + 6.25H - 5A - 161
	var MSJE float64
	if gender == "male"{
		MSJE = (10*weight) + (6.25*height) - (5*float64(age)) + 5
	}else{
		MSJE = (10*weight + 6.25*height - 5*float64(age) - 161.0)
	}
	
	return int(MSJE)
}







// Sedentary (little to no exercise + work a desk job) = 1.2
// Lightly Active (light exercise 1-3 days / week) = 1.375
// Moderately Active (moderate exercise 3-5 days / week) = 1.55
// Very Active (heavy exercise 6-7 days / week) = 1.725
// Extremely Active (very heavy exercise, hard labor job, training 2x / day) = 1.9


//CalculateTDEE returns a TDEE. This is the total daily energy expenditure
func CalculateTDEE(bmr int, act string) int{
	return int(float64(bmr) * activity[act])
}