CREATE TABLE IF NOT EXISTS users(
	id serial PRIMARY KEY,
	email VARCHAR(100) UNIQUE NOT NULL,
	username VARCHAR(100) UNIQUE NOT NULL, 
	password VARCHAR(61) NOT NULL
);
CREATE TABLE IF NOT EXISTS recipes(
	id serial PRIMARY KEY,
	owner INT REFERENCES users(id),
	title VARCHAR(300) NOT NULL,
	description VARCHAR(3000),
	image_url VARCHAR(200),
	source VARCHAR(200),
	source_url VARCHAR(200),
	vegan BOOLEAN,
	vegetarian BOOLEAN,
	serves INT,
	cals_provided BOOLEAN,
	cals_per_serving INT,
	serving_size int,
	type_of_meal VARCHAR(9) NOT NULL,
	public BOOLEAN NOT NULL DEFAULT 't'
);

CREATE TABLE IF NOT EXISTS favourites(
	id serial PRIMARY KEY,
	userid INT REFERENCES users(id) ON DELETE CASCADE,
	recipeid int REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS food_ingredient(
	id serial PRIMARY KEY,
	name VARCHAR(200),
	cal_per_100 INT,
	serving_unit VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS mealplans(
	id serial PRIMARY KEY,
	userid INT NOT NULL,
	created_on DATE,
	CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS days_in_plan(
	id serial PRIMARY KEY,
	ordernth INT,
	day_of_week VARCHAR(9),
	plan_id INT,
	CONSTRAINT fk_plan FOREIGN KEY(plan_id) REFERENCES mealplans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipes_in_day(
	id serial PRIMARY KEY,
	recipeid INT REFERENCES recipes(id) ON DELETE CASCADE,
	day_id INT REFERENCES days_in_plan(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ingredients_from_recipe(
	id serial PRIMARY KEY,
	recipeid INT NOT NULL,
	ingredient_measurement VARCHAR(20),
	ingredient_amount DECIMAL,
	ingredient_title VARCHAR(500),
	CONSTRAINT fk_ing FOREIGN KEY(recipeid) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ingredients_from_foodingredient_from_recipe(
	id serial PRIMARY KEY,
	amount NUMERIC,
	recipeid INT REFERENCES recipes(id) ON DELETE CASCADE,
	foodingredient_id INT,
	CONSTRAINT fk_fi FOREIGN KEY(foodingredient_id) REFERENCES food_ingredient(id) ON DELETE CASCADE
);
	


CREATE TABLE IF NOT EXISTS methods_from_recipe(
	id serial PRIMARY KEY,
	recipeid INT NOT NULL,
	method VARCHAR(2000),
	moment_added TIMESTAMP NOT NULL DEFAULT now(),
	duration_in_minutes NUMERIC NOT NULL DEFAULT 0,
	CONSTRAINT fk_ing FOREIGN KEY(recipeid) REFERENCES recipes(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS profiles(
	id serial PRIMARY KEY,
	user_id INT NOT NULL,
	weight NUMERIC(5,2),
	weight_goal NUMERIC(5,2),
	height NUMERIC(5,2),
	dob DATE,
	gender VARCHAR(7),
	loa VARCHAR(30),
	vegan BOOLEAN,
	vegetarian BOOLEAN,
	glutenallergy BOOLEAN,
	CONSTRAINT fk_user
		FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS jwt_auth(
	id serial PRIMARY KEY,
	user_id INT,
	expires_at timestamp,
	token VARCHAR(137) UNIQUE,
	CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);


CREATE TABLE favourite_recipes(
    id BIGSERIAL PRIMARY KEY,
    userid INT REFERENCES users(id) ON DELETE CASCADE,
    recipeid INT REFERENCES recipes(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS notes_to_recipes(
    id serial PRIMARY KEY,
    recipeid INT REFERENCES recipes(id) ON DELETE CASCADE,
    userid INT REFERENCES users(id) ON DELETE CASCADE,
    note_text VARCHAR(2000),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);