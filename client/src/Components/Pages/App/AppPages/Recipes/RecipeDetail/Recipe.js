import { useEffect, useState } from "react";
import config from "../../../../../../Config/config";

import { Container, CircularProgress } from "@material-ui/core";

import { useHistory, useRouteMatch } from "react-router";
import { useSnackbar } from "notistack";
import { useQuery } from "react-query";

import Ingredients from "./Ingredients";
import Methods from "./Methods";

import RecipeDetails from "./Details";

function Recipe({ userInfo, handleAuthenticatedEndpointRequest }) {
  //const [openImageOpload, setOpenImageUpload] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  // const [totalTime, setTotalTime] = useState(0);
  // const [totalCalories, setTotalCalories] = useState(0);
  // const [totalWeight, setTotalWeight] = useState(0);
  // const [useablePercentage, setUseablePercentage] = useState(0);
  const history = useHistory();
  const { params } = useRouteMatch();
  const [userIsOwner, setUserIsOwner] = useState(false);

  const fetchRecipe = async () => {
    const response = await fetch(
      `${config.API_URL}/api/recipes/detail/${params.id}`
    );
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error("Error. status", response.status);
    }
  };

  const { data, isLoading, isError } = useQuery("recipe", fetchRecipe);
  if (!isLoading && isError) {
    enqueueSnackbar(
      "error fetching recipe, please try again or a different recipe",
      { variant: "error" }
    );
    history.goBack();
  }

  useEffect(() => {
    if (isError) {
      history.goBack();
    }
    if (!isLoading && !isError) {
      setUserIsOwner(data.Owner.username === userInfo.username);
    }
  }, [data, userInfo, isLoading, isError, history]);
  console.log(data);
  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Container
            maxWidth="md"
            // style={{ maxHeight: "80vh", overflow: "scroll", height: "100%" }}
          >
            <RecipeDetails
              data={data}
              userIsOwner={userIsOwner}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
              recipeid={params.id}
            />

            <Ingredients
              userIsOwner={userIsOwner}
              recipeid={params.id}
              // setTotalCalories={setTotalCalories}
              // setTotalWeight={setTotalWeight}
              // setUseablePercentage={setUseablePercentage}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
            />
            <Methods
              recipeid={params.id}
              userIsOwner={userIsOwner}
              handleAuthenticatedEndpointRequest={
                handleAuthenticatedEndpointRequest
              }
              //setTotalTime={setTotalTime}
            />
          </Container>
        </>
      )}
    </>
  );
}

export default Recipe;
