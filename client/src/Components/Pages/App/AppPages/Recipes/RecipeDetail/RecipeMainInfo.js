import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Grow,
} from "@material-ui/core";
import {
  AccessTimeOutlined,
  FlashOnOutlined,
  Star,
  StarBorderOutlined,
} from "@material-ui/icons";
import config from "../../../../../../Config/config";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { useQuery } from "react-query";
import { useSnackbar } from "notistack";
const RecipeMainInfo = ({
  classes,
  data,
  userIsOwner,
  handleAuthenticatedEndpointRequest,
  recipeid,
  addToFavs,
  removeFromFavs,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);
  const client = useQueryClient();
  const checkIfLikedByUser = async () => {
    console.log("checking...");
    return new Promise(async (resolve, reject) => {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/recipes/likedbyuser/${recipeid}`,
        "GET"
      );
      if (response.status === 200) {
        resolve({ liked: true });
      } else if (response.status === 404) {
        resolve({ liked: false });
      } else {
        reject("error checking if liked by user");
      }
    });
  };
  const getAllLikesFromRecipe = async () => {
    const response = await fetch(
      `${config.API_URL}/api/recipes/detail/${recipeid}/likes`
    );
    return response.json();
  };
  const likedByUserQuery = useQuery("likedByUser", checkIfLikedByUser);
  const totalLikesQuery = useQuery("likes", getAllLikesFromRecipe);
  const handleLikeButtonClicked = async () => {
    console.log("likebutton");
    setLikeButtonDisabled(true);
    try {
      await addToFavs(recipeid);
      client.setQueryData("likedByUser", { liked: true });
      client.setQueryData("likes", (old) => ({ Likes: old.Likes + 1 }));
      enqueueSnackbar("Succesfully added the recipe to your favourites");
    } catch (e) {
      enqueueSnackbar(
        "Something went wrong adding this recipe to your favourites"
      );
    }
    setLikeButtonDisabled(false);
  };
  const handleDislikeButtonClicked = async () => {
    console.log("dislikeButton");
    setLikeButtonDisabled(true);
    try {
      await removeFromFavs(recipeid);
      client.setQueryData("likedByUser", { liked: false });
      client.setQueryData("likes", (old) => ({ Likes: old.Likes - 1 }));
      enqueueSnackbar("Succesfully removed the recipe from your favourites");
    } catch (e) {
      enqueueSnackbar(
        "Something went wrong removing this recipe from your favourites"
      );
    }
    setLikeButtonDisabled(false);
  };
  return (
    <Grow in={true}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Box>
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
            </Box>
            <Box>
              {!totalLikesQuery.isLoading &&
              !totalLikesQuery.isError &&
              !likedByUserQuery.isLoading &&
              !likedByUserQuery.isLoading ? (
                <Box display="flex" alignItems="center">
                  <IconButton
                    disabled={likeButtonDisabled}
                    onClick={
                      likedByUserQuery.data.liked
                        ? handleDislikeButtonClicked
                        : handleLikeButtonClicked
                    }
                  >
                    {likedByUserQuery.data.liked ? (
                      <Star />
                    ) : (
                      <StarBorderOutlined />
                    )}
                  </IconButton>
                  <Typography component="span">
                    {totalLikesQuery.data.Likes}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Box>
          {/* {data.Source === "/" ? null : (
          <Typography className={classes.RecipeSource}>
            This recipe was sourced from {data.Source} -{" "}
            <Link href={data.SourceURL}>Go to source</Link>
          </Typography>
        )} */}

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

          {userIsOwner ? (
            <Box display="flex" justifyContent="flex-end">
              <Button color="primary" variant="contained">
                Edit Recipe
              </Button>
            </Box>
          ) : null}
        </CardContent>
      </Card>
    </Grow>
  );
};

export default RecipeMainInfo;
