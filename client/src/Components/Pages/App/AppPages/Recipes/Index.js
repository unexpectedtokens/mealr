import { Box, Grid } from "@material-ui/core";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import Recipe from "./Recipe";

function Recipes(props) {
  const { path } = useRouteMatch();
  return (
    <>
      <Switch>
        <Route path={`${path}/:id`} render={() => <Recipe />} />
        <Route path={path} redner={() => <RecipeList />} />
      </Switch>
    </>
  );
}

export default Recipes;

function RecipeList() {
  return (
    <Box>
      <Grid>yes</Grid>
    </Box>
  );
}
