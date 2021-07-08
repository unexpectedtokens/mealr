import { Route, Switch, useRouteMatch } from "react-router-dom";
import config from "../../../../../Config/config";
import Recipe from "./RecipeDetail/Recipe";
import RecipeList from "./RecipeList";
import AddRecipe from "./AddRecipe";
import { useEffect } from "react";
import RecipeLanding from "./RecipeLanding";
import { Helmet } from "react-helmet";

function Recipes({
  navigate,
  setActiveRoute,
  refresh,
  handleAuthenticatedEndpointRequest,
  userInfo,
}) {
  const { path } = useRouteMatch();
  useEffect(() => {
    setActiveRoute("recipes");
    //eslint-disable-next-line
  }, []);
  const handleAddToFavourites = async (id) => {
    return new Promise(async (resolve, reject) => {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/recipes/like/${id}`,
        "POST"
      );
      if (response.status !== 200) {
        throw new Error(response.status);
      } else {
        return resolve("ok");
      }
    });
  };
  const handleRemoveFromFavourites = async (id) => {
    return new Promise(async (resolve, reject) => {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/recipes/like/${id}`,
        "DELETE"
      );
      if (response.status !== 200) {
        throw new Error(response.status);
      } else {
        return resolve("ok");
      }
    });
  };
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
              handleAddToFavourites={handleAddToFavourites}
              handleRemoveFromFavourites={handleRemoveFromFavourites}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
            />
          )}
        />
        <Route
          path={`${path}/create`}
          render={() => (
            <AddRecipe
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
              handleAddToFavourites={handleAddToFavourites}
              handleRemoveFromFavourites={handleRemoveFromFavourites}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
            />
          )}
        />
        <Route
          path={`${path}/all`}
          render={() => (
            <RecipeList
              navigate={navigate}
              handleAddToFavourites={handleAddToFavourites}
              handleRemoveFromFavourites={handleRemoveFromFavourites}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
              url={`${config.API_URL}/api/recipes/listall/`}
            />
          )}
        />
        <Route
          path={`${path}/detail/:id`}
          render={() => (
            <Recipe
              userInfo={userInfo}
              addToFavs={handleAddToFavourites}
              removeFromFavs={handleRemoveFromFavourites}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
            />
          )}
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
