import {
  Box,
  Grid,
  Card,
  Typography,
  CardMedia,
  makeStyles,
  CardContent,
  CardActions,
  Button,
  Grow,
  Divider,
} from "@material-ui/core";
import { useState } from "react";
import ImgPlaceHolder from "../../../../../assets/images/pexels-anna-tukhfatullina-food-photographerstylist-2611817.jpeg";

const useStyles = makeStyles({
  CardImage: {
    width: "100%",
    transform: "scale(1.05)",
    filter: "brightness(70%)",
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
  },
  // CardImageBlur: {
  //   position: "absolute",
  //   bottom: 0,
  //   width: "100%",
  //   zIndex: 1,
  //   left: 0,
  //   height: "30%",
  //   backgroundColor: "#111",
  //   opacity: 0.6,
  //   filter: "blur(1px)",
  // },
});

function RecipeCard(props) {
  const [hover, setHover] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { recipe } = props;
  const classes = useStyles();
  return (
    <Grid item md={4} xs={12} sm={6} lg={3}>
      <Grow
        in={imageLoaded || recipe.ImageURL === ""}
        //{...(imageLoaded ? { timeout: props.index * 100 } : {})}
      >
        <Card
          className={hover ? classes.CardOnHover : classes.CardNeutral}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => props.navigate(`/recipes/detail/${recipe.ID}`)}
        >
          <Box position="relative" style={{ cursor: "pointer" }}>
            {recipe.ImageURL !== "" ? (
              <CardMedia>
                <img
                  src={recipe.ImageURL}
                  className={classes.CardImage}
                  onLoad={() => setImageLoaded(true)}
                  alt={recipe.Title}
                />
                <div className={classes.CardImageBlur}></div>
              </CardMedia>
            ) : (
              <CardMedia>
                <img
                  src={ImgPlaceHolder}
                  className={classes.CardImage}
                  onLoad={() => setImageLoaded(true)}
                  alt={recipe.Title}
                />
                <div className={classes.CardImageBlur}></div>
              </CardMedia>
            )}

            <CardContent className={classes.CardContent}>
              <Typography variant="h6" className={classes.CardHeader}>
                {recipe.Title}
              </Typography>
            </CardContent>
            {/* <Divider light />
            <CardActions>
              <Box
                display="flex"
                justifyContent="center"
                flexDirection="row"
                width="100%"
              >
                <Button
                  variant="contained"
                  color="primary"
                  elevation="0"
                  className={classes.Button}
                  
                >
                  See more
                </Button>
              </Box>
            </CardActions> */}
          </Box>
        </Card>
      </Grow>
    </Grid>
  );
}

export default RecipeCard;
