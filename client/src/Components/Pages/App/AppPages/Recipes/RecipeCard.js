import {
  Box,
  Grid,
  Card,
  Typography,
  CardMedia,
  makeStyles,
  CardContent,
  Grow,
  IconButton,
} from "@material-ui/core";
import { StarBorderOutlined, Star } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { useState } from "react";
import ImgPlaceHolder from "../../../../../assets/images/pexels-anna-tukhfatullina-food-photographerstylist-2611817.jpeg";

const useStyles = makeStyles({
  CardImage: {
    width: "100%",
    transform: "scale(1.05)",
    filter: "brightness(80%)",
  },
  CardHeader: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#fff",
    textTransform: "capitalize",
  },
  CenterStuff: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  "@keyframes grow": {
    "0%": {
      transform: "translateY(0)",
    },
    "100%": {
      transform: "translateY(-10px)",
    },
  },
  "@keyframes shrink": {
    "0%": {
      transform: "translateY(-10px)",
    },
    "100%": {
      transform: "translateY(0)",
    },
  },
  CardOnHover: {
    animation: "$grow .3s",
    animationFillMode: "both",
  },
  CardNeutral: {
    animation: "$shrink .3s",
    animationFillMode: "both",
  },
  CardContent: {
    backgroundColor: "transparent",
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    padding: "2rem",
    zIndex: 3,
    pointerEvents: "none",
  },
  LikeBox: {
    position: "absolute",
    zIndex: 4,
    display: "flex",
    alignItems: "center",
    top: 0,
    left: 0,
    "& svg": {
      fill: "#fff",
      fontSize: "1.5rem",
    },
    "& span": {
      color: "#fff",
      fontWeight: 500,
      fontSize: "1rem",
    },
  },
});

function RecipeCard({
  handleLikeButtonClick,
  handleDislikeButtonClick,
  recipe,
  navigate,
}) {
  const [hover, setHover] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [handlingFavMod, setHandlingFavMod] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const likeRecipe = async () => {
    setHandlingFavMod(true);
    try {
      await handleLikeButtonClick(recipe.ID);
      enqueueSnackbar("Succesfully added the recipe to your favourites");
    } catch (e) {
      enqueueSnackbar("something went wrong adding this recipe to favourites");
    }

    setHandlingFavMod(false);
  };
  const dislikeRecipe = async () => {
    setHandlingFavMod(true);
    try {
      await handleDislikeButtonClick(recipe.ID);
      enqueueSnackbar("Succesfully removed the recipe from your favourites");
    } catch (e) {
      enqueueSnackbar(
        "something went wrong removing this recipe from your favourites"
      );
    }

    setHandlingFavMod(false);
  };
  return (
    <Grid item md={4} xs={12} sm={6} lg={3}>
      <Grow in={imageLoaded || recipe.ImageURL === ""}>
        <Card
          className={hover ? classes.CardOnHover : classes.CardNeutral}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Box position="relative" style={{ cursor: "pointer" }}>
            <Box className={classes.LikeBox} pl={1} pt={1}>
              <IconButton
                onClick={recipe.LikedByUser ? dislikeRecipe : likeRecipe}
                disabled={handlingFavMod}
              >
                {recipe.LikedByUser ? <Star /> : <StarBorderOutlined />}
              </IconButton>
              <Typography
                style={{ pointerEvents: "none", color: "#fff" }}
                variant="h6"
              >
                {recipe.Likes}
              </Typography>
            </Box>
            {recipe.ImageURL !== "" ? (
              <CardMedia
                onClick={() => navigate(`/recipes/detail/${recipe.ID}`)}
              >
                <img
                  src={recipe.ImageURL}
                  className={classes.CardImage}
                  onLoad={() => setImageLoaded(true)}
                  alt={recipe.Title}
                />
              </CardMedia>
            ) : (
              <CardMedia
                onClick={() => navigate(`/recipes/detail/${recipe.ID}`)}
              >
                <img
                  src={ImgPlaceHolder}
                  className={classes.CardImage}
                  onLoad={() => setImageLoaded(true)}
                  alt={recipe.Title}
                />
              </CardMedia>
            )}

            <CardContent className={classes.CardContent}>
              <Typography variant="h6" className={classes.CardHeader}>
                {recipe.Title}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      </Grow>
    </Grid>
  );
}

export default RecipeCard;
