import { Route, Switch, useRouteMatch } from "react-router-dom";
import config from "../../../../../Config/config";
import Recipe from "./Recipe";
import RecipeList from "./RecipeList";
import AddRecipe from "./AddRecipe";
import { useEffect } from "react";
import RecipeLanding from "./RecipeLanding";
import { Helmet } from "react-helmet";

function Recipes({
  navigate,
  setActiveRoute,
  auth,
  refresh,
  handleAuthenticatedEndpointRequest,
  userInfo,
}) {
  const { path } = useRouteMatch();
  useEffect(() => {
    setActiveRoute("recipes");
    //eslint-disable-next-line
  }, []);
  return (
    <>
      <Helmet>
        <title>Recipes</title>
      </Helmet>
      <Switch>
        <Route
          path={`${path}/my`}
          render={() => (
            <RecipeList
              navigate={navigate}
              url={`${config.API_URL}/api/recipes/listmine/`}
              auth={auth}
            />
          )}
        />
        <Route
          path={`${path}/create`}
          render={() => (
            <AddRecipe
              auth={auth}
              refresh={refresh}
              navigate={navigate}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
            />
          )}
          refresh={refresh}
        />
        <Route
          path={`${path}/fav`}
          render={() => (
            <RecipeList
              navigate={navigate}
              url={`${config.API_URL}/api/recipes/listfav/`}
            />
          )}
        />
        <Route
          path={`${path}/all`}
          render={() => (
            <RecipeList
              navigate={navigate}
              url={`${config.API_URL}/api/recipes/listall/`}
            />
          )}
        />
        <Route
          path={`${path}/detail/:id`}
          render={() => <Recipe userInfo={userInfo} />}
        />
        <Route
          path={`${path}`}
          exact
          render={() => <RecipeLanding navigate={navigate} />}
        />
      </Switch>
    </>
  );
}

export default Recipes;
