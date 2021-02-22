package models

import (
	"database/sql"
	"fmt"
	"time"

	db "github.com/unexpectedtokens/mealr/database"
)


const (
	//LayoutUS shows how dates should be formatted
	LayoutUS  = "January 2, 2006"
)

//Profile is the struct that represents a users profile
type Profile struct {
	ID int64
	Height float64
	Weight float64
	WeightGoal float64
	UserID UserID
	Gender string
	Dob time.Time
	Loa string
}
//PTCFields specify the fields that are Permitted to Change
type PTCFields struct {
	Height float64
	Weight float64
	WeightGoal float64
	Dob time.Time
	Gender string
}
//NewProfile creates a profile instance and sets the default allowed to update field to the below specified ones
// func NewProfile() *Profile{
// 	return &Profile{AllowedToUpdate: []string{"age", "height", "weight_goal", "weight"}}
// }

//Save is a function to create a profile
func (p *Profile) Save() {
	if p.UserID != 0{
		_, err := db.DBCon.Query("INSERT INTO profiles (user_id, vegan, vegetarian, glutenallergy) VALUES ($1, $2, $3, $4) RETURNING id;", p.UserID, false, false, false)
		if err!=nil{
			panic(err)
		}
	}
}

//Validate checks incoming data for null values
func (p *Profile) Validate() bool{
	valid := true
	if p.Height == 0{
		valid = false
	}
	valid = valid && p.Height > 0
	valid = valid && p.Gender != ""
	valid = valid && p.Weight > 0
	valid = valid && int(time.Since(p.Dob).Hours()) / (24 * 365) > 5
	return valid
}


type nullableFields struct{
	Height sql.NullFloat64
	WeightGoal sql.NullFloat64
	Weight sql.NullFloat64
	Dob sql.NullTime
	Gender sql.NullString
	Loa sql.NullString
	
}


func (n *nullableFields) populateNFields(p *Profile){
	if n.Height.Valid{
		p.Height = n.Height.Float64
	} else {
		p.Height = float64(0)
	}
	if n.WeightGoal.Valid{
		p.WeightGoal = n.WeightGoal.Float64
	} else{
		p.WeightGoal = float64(0)
	}
	if n.Weight.Valid{
		p.Weight = n.Weight.Float64
	} else{
		p.Weight = float64(0)
	}
	if n.Dob.Valid{
		p.Dob = n.Dob.Time
	} else {
		p.Dob = time.Time{}
	}
	if n.Gender.Valid{
		p.Gender = n.Gender.String
	}else {
		p.Gender = ""
	}
	if n.Loa.Valid{
		p.Loa = n.Loa.String
	}else{
		p.Loa = ""
	}
}


//Retrieve retrieves a profile row from the db with a received uid
func (p *Profile) Retrieve()  error{
	stmt, err := db.DBCon.Prepare("SELECT id, height, dob, weight_goal, weight, gender, loa FROM profiles WHERE user_id=$1;")
	if err !=nil{
		return err
	}
	var nf nullableFields

	err = stmt.QueryRow(p.UserID).Scan(&p.ID, &nf.Height, &nf.Dob ,&nf.WeightGoal, &nf.Weight, &nf.Gender, &nf.Loa)
	if (err != nil) || p.ID == 0{
		return err
	}
	nf.populateNFields(p)
	return nil
}

//Update updates an existing profile. It only changes the fields that are different than the existing profile
func (p *Profile) Update(NewProfile Profile) error{
	q:="UPDATE profiles SET "
	values := []interface{}{}
	if p.Height != NewProfile.Height{
		values = append(values, NewProfile.Height)
		q += fmt.Sprintf("height=$%d, ", len(values))
	}
	if p.Weight != NewProfile.Weight{
		values = append(values, NewProfile.Weight)
		q += fmt.Sprintf("weight=$%d, ", len(values))
	}
	if p.WeightGoal != NewProfile.WeightGoal{
		values = append(values, NewProfile.WeightGoal)
		q += fmt.Sprintf("weight_goal=$%d, ", len(values))
	}
	if p.Dob != NewProfile.Dob{
		values = append(values, NewProfile.Dob)
		q += fmt.Sprintf("dob=$%d, ", len(values))
	}
	if p.Gender != NewProfile.Gender{
		values = append(values, NewProfile.Gender)
		q += fmt.Sprintf("gender=$%d, ", len(values))
	}
	if p.Loa != NewProfile.Loa{
		values = append(values, NewProfile.Loa)
		q += fmt.Sprintf("loa=$%d, ", len(values))
	}
	if len(values) == 0{
		return fmt.Errorf("Data not different")
	}
	values = append(values, p.UserID)
	q = q[0:len(q)-2] + fmt.Sprintf(" WHERE user_id=$%d;", len(values))
	fmt.Println(q)
	stmt, err := db.DBCon.Prepare(q)
	if err != nil{
		return err
	}
	var id int
	err = stmt.QueryRow(values...).Scan(&id)
	//stmt, err := db.DBCon.Prepare(q)
	// a := p.AllowedToUpdate
	// data := []string{""}
	// fmt.Println(data)
	// query := "UPDATE users ()"
	return nil
}




//1 Check which ones are different
//2 Build sql query based on differences