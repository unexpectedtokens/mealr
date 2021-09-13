import { useEffect, useState } from "react";
import config from "../../../../../../Config/config";
import {
  Card,
  Container,
  CircularProgress,
  Grow,
  makeStyles,
  Grid,
} from "@material-ui/core";

import { useHistory, useRouteMatch } from "react-router";
import { useSnackbar } from "notistack";
import { useQuery } from "react-query";
import PlaceHolderImage from "../../../../../../assets/images/pexels-anna-tukhfatullina-food-photographerstylist-2611817.jpeg";
import Ingredients from "./Ingredients";
import Methods from "./Methods";
import RecipeMainInfo from "./RecipeMainInfo";

const useStyles = makeStyles((theme) => ({
  RecipeImage: {
    width: "100%",
    transform: "scale(1.05)",
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

function Recipe({
  userInfo,
  handleAuthenticatedEndpointRequest,
  addToFavs,
  removeFromFavs,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [totalTime, setTotalTime] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [useablePercentage, setUseablePercentage] = useState(0);
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
            <Grow in={true}>
              <Grid
                container
                spacing={2}
                alignContent="flex-start"
                alignItems="flex-start"
              >
                <Grid item md={6} lg={6}>
                  <Card>
                    <img
                      className={classes.RecipeImage}
                      src={data.ImageURL ? data.ImageURL : PlaceHolderImage}
                      alt={data.Title}
                    />
                  </Card>
                </Grid>
                <Grid
                  container
                  item
                  md={6}
                  lg={6}
                  spacing={2}
                  direction="column"
                  justify="space-between"
                >
                  <Grid item md={12} lg={12} xs={12} sm={12}>
                    <RecipeMainInfo
                      data={data}
                      userIsOwner={userIsOwner}
                      classes={classes}
                      recipeid={params.id}
                      addToFavs={addToFavs}
                      removeFromFavs={removeFromFavs}
                      totalTime={totalTime}
                      totalWeight={totalWeight}
                      description={data.Description}
                      totalCalories={totalCalories}
                      useablePercentage={useablePercentage}
                      handleAuthenticatedEndpointRequest={
                        handleAuthenticatedEndpointRequest
                      }
                    />
                  </Grid>
                  {/* <Grid item md={12} lg={12} xs={12} sm={12}>
                    <Grow in={true}>
                      <Description
                        description={data.Description}
                        recipeid={params.id}
                      />
                    </Grow>
                  </Grid>*/}
                </Grid>

                <Grid item container spacing={2}>
                  <Grid item md={6} sm={12} xs={12}>
                    <Ingredients
                      userIsOwner={userIsOwner}
                      recipeid={params.id}
                      setTotalCalories={setTotalCalories}
                      setTotalWeight={setTotalWeight}
                      setUseablePercentage={setUseablePercentage}
                      handleAuthenticatedEndpointRequest={
                        handleAuthenticatedEndpointRequest
                      }
                    />
                  </Grid>
                  <Grid item md={6} sm={12} xs={12}>
                    <Methods
                      recipeid={params.id}
                      userIsOwner={userIsOwner}
                      handleAuthenticatedEndpointRequest={
                        handleAuthenticatedEndpointRequest
                      }
                      setTotalTime={setTotalTime}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grow>
          </Container>
        </>
      )}
    </>
  );
}

export default Recipe;
