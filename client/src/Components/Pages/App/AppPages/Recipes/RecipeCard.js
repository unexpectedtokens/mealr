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

const useStyles = makeStyles({
  CardImage: {
    width: "100%",
    minHeight: 150,
  },
  CardHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
  },
  CardSource: {
    fontSize: "0.8rem",
    color: "#555",
  },
  CenterStuff: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  Button: {
    fontWeight: "bold",
    fontSize: "0.8rem",
  },
});

function RecipeCard(props) {
  const [hover, setHover] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { recipe } = props;
  const classes = useStyles();
  return (
    <Grid item md={4} xs={12} sm={6} lg={4}>
      <Grow
        in={imageLoaded}
        //{...(imageLoaded ? { timeout: props.index * 100 } : {})}
      >
        <Card
          elevation={hover ? 0 : 1}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Box>
            <CardMedia>
              <img
                src={recipe.ImageURL}
                className={classes.CardImage}
                onLoad={() => setImageLoaded(true)}
                alt={recipe.Title}
              />
            </CardMedia>
            <CardContent className={classes.CenterStuff}>
              <Typography
                variant="h6"
                className={classes.CardHeader}
                align="center"
              >
                {recipe.Title}
              </Typography>
              <Typography className={classes.CardSource}>
                Source: {recipe.Source}
              </Typography>
            </CardContent>
            <Divider light />
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
                  onClick={() => props.navigate(`/recipes/${recipe.ID}`)}
                >
                  See more
                </Button>
              </Box>
            </CardActions>
          </Box>
        </Card>
      </Grow>
    </Grid>
  );
}

export default RecipeCard;
