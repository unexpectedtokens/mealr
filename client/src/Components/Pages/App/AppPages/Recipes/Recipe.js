import { useEffect, useState } from "react";
import config from "../../../../../Config/config";
import {
  Box,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Divider,
  Grow,
  Link,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { AccessTimeOutlined, FlashOnOutlined } from "@material-ui/icons";
import { useHistory, useRouteMatch } from "react-router";
import { useSnackbar } from "notistack";
import { useQuery } from "react-query";

const useStyles = makeStyles((theme) => ({
  RecipeImage: {
    width: "100%",
  },
  RecipeTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  RecipeSource: {
    fontSize: "0.8rem",
    paddingBottom: "2rem",
  },
  username: {
    color: theme.palette.primary.main,
  },
}));

function Recipe({ userInfo }) {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { params } = useRouteMatch();
  const [userIsOwner, setUserIsOwner] = useState(false);
  const classes = useStyles();
  const fetchRecipe = async () => {
    const response = await fetch(
      `${config.API_URL}/api/recipes/detail/${params.id}`
    );
    console.log(response);
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
    if (!isLoading && !isError) {
      setUserIsOwner(data.Owner.username === userInfo.username);
    }
  }, [data, userInfo, isLoading, isError]);
  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Container maxWidth="md">
            <Grow in={true}>
              <Card>
                {data.ImageURL ? (
                  <img
                    className={classes.RecipeImage}
                    src={data.ImageURL}
                    alt={data.Title}
                  />
                ) : null}

                <CardContent>
                  <Typography variant="h6" className={classes.RecipeTitle}>
                    {data.Title}
                  </Typography>
                  <Typography>
                    Created by{" "}
                    <span className={classes.username}>
                      {userIsOwner ? "You" : data.Owner.username}
                    </span>
                  </Typography>
                  <Typography>Type of Meal: {data.TypeOfMeal}</Typography>
                  {data.Source === "/" ? null : (
                    <Typography className={classes.RecipeSource}>
                      This recipe was sourced from {data.Source} -{" "}
                      <Link href={data.SourceURL}>Go to source</Link>
                    </Typography>
                  )}

                  <Box display="flex">
                    {data.PrepTime ? (
                      <Box display="flex" p={1} alignItems="center">
                        <AccessTimeOutlined />
                        <Box pl={2}>
                          <Typography>Prep time: </Typography>
                          <Typography>{data.PrepTime}</Typography>
                        </Box>
                      </Box>
                    ) : null}
                    {data.CookingTime ? (
                      <Box display="flex" p={1} alignItems="center">
                        <AccessTimeOutlined />
                        <Box pl={2}>
                          <Typography>Cooking time: </Typography>
                          <Typography>{data.CookingTime}</Typography>
                        </Box>
                      </Box>
                    ) : null}
                    {data.CalsProvided ? (
                      <Box display="flex" p={1} alignItems="center">
                        <FlashOnOutlined />
                        <Box pl={2}>
                          <Typography>Calories per serving: </Typography>
                          <Typography>{data.CalsPerServing}</Typography>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
            <Grow in={true}>
              <Box py={2}>
                <Card>
                  <CardContent>
                    <Typography>Description</Typography>
                    <Typography>
                      {data.Description ? data.Description : "-"}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grow>
          </Container>
        </>
        // <Typography variant="h6">Ingredients</Typography>
        // {/* <List>
        //   {recipe.IngredientsFromFoodIngredients !== null
        //     ? recipe.IngredientsFromFoodIngredients.map((ing) => {
        //         return (
        //           <ListItem key={ing}>
        //             <ListItemText>
        //               {ing.Amount && ing.Amount > 0
        //                 ? ing.Amount.toFixed(1)
        //                 : null}{" "}
        //               {ing.Measurement} {ing.Title}
        //             </ListItemText>
        //           </ListItem>
        //         );
        //       })
        //     : null}
        // </List> */}
        // <Divider light />
        // <Typography variant="h6">Method</Typography>
        // {/* <List>
        //   {recipe.Method.map((met) => {
        //     return (
        //       <ListItem key={met}>
        //         <ListItemText>
        //           <span style={{ fontWeight: "bold" }}>{met[0]}:</span>
        //           {met.slice(1, met.length)}
        //         </ListItemText>
        //       </ListItem>
        //     );
        //   })}
        // </List> */}
      )}
    </>
  );
}

export default Recipe;
