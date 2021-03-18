import { Box, Button, CircularProgress, Grid } from "@material-ui/core";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useEffect, useState } from "react";
import config from "../../../../../Config/config";
import Recipe from "./Recipe";
import RecipeCard from "./RecipeCard";

function Recipes({ navigate }) {
  const { path } = useRouteMatch();
  return (
    <>
      <Switch>
        <Route path={`${path}/:id`} render={() => <Recipe />} />
        <Route path={path} render={() => <RecipeList navigate={navigate} />} />
      </Switch>
    </>
  );
}

export default Recipes;

function RecipeList({ navigate }) {
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  // const { path } = useRouteMatch();
  //const history = useHistory();
  const fetchRecipeList = async (offset) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.API_URL}/api/recipes/list/?offset=${offset}`
      );
      const data = await response.json();
      const newRecipes = [...recipes];
      data.forEach((rec) => newRecipes.push(rec));
      setRecipes(newRecipes);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const increaseLimitAndFetch = () => {
    setOffset((num) => num + 10);
  };
  useEffect(() => {
    fetchRecipeList(offset);
    //eslint-disable-next-line
  }, [offset]);
  return (
    <Box>
      <Grid
        container
        direction="row"
        spacing={2}
        alignContent="flex-start"
        alignItems="flex-start"
      >
        {recipes.map((rec, index) => (
          <RecipeCard
            recipe={rec}
            key={rec.ID}
            navigate={navigate}
            index={index}
          />
        ))}
      </Grid>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : null}
      <Box display="flex" justifyContent="center" py={4} color="secondary">
        <Button onClick={increaseLimitAndFetch} variant="outlined">
          See more recipes
        </Button>
      </Box>
    </Box>
  );
}
