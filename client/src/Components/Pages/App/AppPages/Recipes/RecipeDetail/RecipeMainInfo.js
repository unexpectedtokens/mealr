import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Grow,
  Backdrop,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import {
  AccessTimeOutlined,
  FlashOnOutlined,
  InfoOutlined,
  Star,
  StarBorderOutlined,
} from "@material-ui/icons";
import config from "../../../../../../Config/config";
import { useCallback, useEffect, useState } from "react";
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
  totalTime,
  totalCalories,
  useablePercentage,
  totalWeight,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("");
  const [newVegan, setNewVegan] = useState(false);
  const [newVegetarian, setNewVegetarian] = useState(false);
  const [newPublic, setNewPublic] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const client = useQueryClient();
  const checkIfLikedByUser = async () => {
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
  const handleSave = async () => {
    const body = JSON.stringify({
      Title: newTitle,
      Description: newDescription,
      TypeOfMeal: newType,
      Vegan: newVegan,
      Vegetarian: newVegetarian,
      Public: newPublic,
    });

    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/detail/${recipeid}`,
      "PATCH",
      body
    );
    if (response.status === 200) {
      client.setQueryData("recipe", (old) => {
        return {
          ...old,
          Title: newTitle,
          Description: newDescription,
          TypeOfMeal: newType,
          Vegan: newVegan,
          Vegetarian: newVegetarian,
          Public: newPublic,
        };
      });
      setOpenEdit(false);
    }
  };

  const resetNewData = useCallback(() => {
    setNewTitle(data.Title);
    setNewDescription(data.Description);
    setNewType(data.TypeOfMeal);
    setNewVegan(data.Vegan);
    setNewVegetarian(data.Vegetarian);
  }, [
    data.Title,
    data.Description,
    data.TypeOfMeal,
    data.Vegan,
    data.Vegetarian,
  ]);

  const handleCancel = () => {
    setOpenEdit(false);
    resetNewData();
  };

  useEffect(() => {
    resetNewData();
  }, [resetNewData]);

  return (
    <>
      <Backdrop open={openEdit} style={{ zIndex: 1000 }}>
        <Card>
          <Box p={2} minWidth={300}>
            <Box pb={2}>
              <TextField
                fullWidth
                value={newTitle}
                label="title"
                variant="outlined"
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </Box>
            <Box pb={2}>
              <TextField
                fullWidth
                multiline={true}
                value={newDescription}
                label="description"
                variant="outlined"
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </Box>
            <Box pb={2}>
              <FormControl fullWidth>
                <InputLabel id="toml">Type of recipe</InputLabel>
                <Select
                  labelId="toml"
                  fullWidth
                  variant="outlined"
                  //label="Type of recipe"
                  id="typeOfRecipe"
                  name="typeOfRecipe"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  {["", "Breakfast", "Lunch", "Dinner", "Dessert", "Snack"].map(
                    (item) => {
                      return (
                        <MenuItem key={item} value={item}>
                          {item ? item : "Unspecified"}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newPublic}
                    onChange={() => setNewPublic((cur) => !cur)}
                    name="public"
                    color="primary"
                  />
                }
                label="Public"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newVegetarian}
                    onChange={() => setNewVegetarian((cur) => !cur)}
                    name="vegetarian"
                    color="primary"
                  />
                }
                label="Vegetarian"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newVegan}
                    onChange={() => setNewVegan((cur) => !cur)}
                    name="vegan"
                    color="primary"
                  />
                }
                label="Vegan"
              />
            </Box>
            <Box pt={2} display="flex">
              <Box pr={2}>
                <Button onClick={handleCancel} color="secondary">
                  Cancel
                </Button>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disableElevation
                fullWidth
              >
                Save
              </Button>
            </Box>
          </Box>
        </Card>
      </Backdrop>
      <Grow in={true}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h6" className={classes.RecipeTitle}>
                  {data.Title}
                </Typography>
                <Box display="flex" justifyContent="flex-start" py={2}>
                  <Box pr={2}>
                    {data.Vegetarian ? (
                      <Typography color="primary">Vegetarian</Typography>
                    ) : null}
                  </Box>
                  {data.Vegan ? (
                    <Typography color="primary">Vegan</Typography>
                  ) : null}
                </Box>
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
            <Box display="flex">
              <Box display="flex" p={1} alignItems="center">
                <AccessTimeOutlined />
                <Box pl={2}>
                  <Typography>{totalTime} Minutes</Typography>
                </Box>
              </Box>
              <Box display="flex" p={1} alignItems="center">
                <FlashOnOutlined />
                <Box pl={2}>
                  <Typography>
                    <Typography style={{ fontWeight: "bold" }} component="span">
                      Total:
                    </Typography>{" "}
                    {totalCalories}kcal
                  </Typography>
                  <Typography>
                    <Typography style={{ fontWeight: "bold" }} component="span">
                      Per 100g:
                    </Typography>{" "}
                    {Math.round(totalCalories / (totalWeight / 100))}kcal
                  </Typography>
                  <Typography variant="body2">
                    These calculations were {Math.round(useablePercentage)}%
                    accurate.{" "}
                    {!showInfo ? (
                      <IconButton
                        onClick={() => setShowInfo(true)}
                        size="small"
                      >
                        <InfoOutlined />
                      </IconButton>
                    ) : (
                      `This means that ${useablePercentage}% of ingredients were useable in the calculations. `
                    )}
                    {useablePercentage < 80 && userIsOwner
                      ? "To ensure a higher accurary, try only using ingredients from our database."
                      : null}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {userIsOwner ? (
              <Box>
                <Typography>
                  This recipe is{" "}
                  {data.Public ? (
                    <Typography
                      component="span"
                      display="inline"
                      color="primary"
                    >
                      Public
                    </Typography>
                  ) : (
                    <Typography
                      component="span"
                      display="inline"
                      color="secondary"
                    >
                      Private
                    </Typography>
                  )}
                </Typography>
              </Box>
            ) : null}

            <Box py={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Description</Typography>
              </Box>
              <Typography>
                {data.Description ? data.Description : "-"}
              </Typography>
            </Box>
            {userIsOwner ? (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => setOpenEdit(true)}
                >
                  Edit Recipe
                </Button>
              </Box>
            ) : null}
          </CardContent>
        </Card>
      </Grow>
    </>
  );
};

export default RecipeMainInfo;
