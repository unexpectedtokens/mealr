import { useEffect, useState } from "react";
import config from "../../../../../Config/config";
import {
  Box,
  Card,
  CardContent,
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

const useStyles = makeStyles({
  RecipeImage: {
    width: "100%",
  },
  RecipeTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
  },
  RecipeSource: {
    fontSize: "0.8rem",
    paddingBottom: "2rem",
  },
});

function Recipe(props) {
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [recipe, setRecipe] = useState({});
  const history = useHistory();
  const { params } = useRouteMatch();
  const classes = useStyles();
  const fetchRecipe = async () => {
    try {
      const response = await fetch(
        `${config.API_URL}/api/recipes/detail/${params.id}`
      );
      const data = await response.json();
      console.log(data);
      setRecipe(data);
      setLoading(false);
    } catch (e) {
      console.log(e);
      history.goBack();
    }
  };
  useEffect(() => {
    fetchRecipe();
    //eslint-disable-next-line
  }, []);
  return (
    <Grow in={imageLoaded}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Card>
          <img
            className={classes.RecipeImage}
            src={recipe.ImageURL}
            alt={recipe.Title}
            onLoad={() => setImageLoaded(true)}
          />
          <CardContent>
            <Typography variant="h6" className={classes.RecipeTitle}>
              {recipe.Title}
            </Typography>
            <Typography className={classes.RecipeSource}>
              This recipe was sourced from {recipe.Source} -{" "}
              <Link href={recipe.SourceURL}>Go to source</Link>
            </Typography>
            <Box display="flex">
              <Box display="flex" p={1} alignItems="center">
                <AccessTimeOutlined />
                <Box pl={2}>
                  <Typography>Prep time: </Typography>
                  <Typography>{recipe.PrepTime}</Typography>
                </Box>
              </Box>
              <Box display="flex" p={1} alignItems="center">
                <AccessTimeOutlined />
                <Box pl={2}>
                  <Typography>Cooking time: </Typography>
                  <Typography>{recipe.PrepTime}</Typography>
                </Box>
              </Box>
              {recipe.CalsProvided ? (
                <Box display="flex" p={1} alignItems="center">
                  <FlashOnOutlined />
                  <Box pl={2}>
                    <Typography>Calories per serving: </Typography>
                    <Typography>{recipe.CalsPerServing}</Typography>
                  </Box>
                </Box>
              ) : null}
            </Box>
            <Divider light />
            <Typography variant="h6">Ingredients</Typography>
            <List>
              {recipe.Ingredients.map((ing) => {
                return (
                  <ListItem key={ing}>
                    <ListItemText>{ing}</ListItemText>
                  </ListItem>
                );
              })}
            </List>
            <Divider light />
            <Typography variant="h6">Method</Typography>
            <List>
              {recipe.Method.map((met) => {
                return (
                  <ListItem key={met}>
                    <ListItemText>
                      <span style={{ fontWeight: "bold" }}>{met[0]}:</span>
                      {met.slice(1, met.length)}
                    </ListItemText>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}
    </Grow>
  );
}

export default Recipe;
