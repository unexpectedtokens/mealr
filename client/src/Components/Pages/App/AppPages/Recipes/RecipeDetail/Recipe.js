import { useEffect, useState } from "react";
import config from "../../../../../../Config/config";
import { EditOutlined } from "@material-ui/icons";

import {
  Box,
  Card,
  Container,
  CircularProgress,
  Grow,
  makeStyles,
  Grid,
  IconButton,
  Backdrop,
} from "@material-ui/core";

import { useHistory, useRouteMatch } from "react-router";
import { useSnackbar } from "notistack";
import { useQuery } from "react-query";
import PlaceHolderImage from "../../../../../../assets/images/pexels-anna-tukhfatullina-food-photographerstylist-2611817.jpeg";
import Ingredients from "./Ingredients";
import Methods from "./Methods";
import RecipeMainInfo from "./RecipeMainInfo";
import ImageUpload from "./ImageUpload";
import RecipeDetails from "./Details";

const useStyles = makeStyles((theme) => ({
  RecipeImage: {
    width: "100%",
    transform: "scale(1.05)",
    filter: "brightness(90%)",
  },
  RecipeImageChangeButton: {
    position: "absolute",
    zIndex: 4,
    display: "flex",
    alignItems: "center",
    top: 2,
    left: 2,
    "& svg": {
      fill: "#fff",
      fontSize: "2rem",
    },
  },
  RecipeTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  RecipeSource: {
    fontSize: "0.8rem",
    paddingBottom: "2rem",
  },
  username: {
    color: theme.palette.primary.main,
  },
}));

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
  const classes = useStyles();
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
