import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";

const RecipeList = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { navigate, url } = props;
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [moreAvailable, setMoreAvailable] = useState(true);
  // const { path } = useRouteMatch();
  //const history = useHistory();
  const fetchRecipeList = async (offset) => {
    setLoading(true);
    try {
      const response = await fetch(`${url}?offset=${offset}`, {
        method: "GET",
        headers: { Authorization: props.auth ? props.auth.Key : "" },
      });
      if (response.status !== 200) {
        enqueueSnackbar("Something went wrong fetching recipes", {
          variant: "error",
        });
        return;
      }
      console.log(response);
      const data = await response.json();
      console.log(data);
      const newRecipes = [...recipes];
      if (newRecipes.length < 10) {
        setMoreAvailable(false);
      }
      data.forEach((rec) => newRecipes.push(rec));
      setRecipes(newRecipes);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const increaseLimitAndFetch = () => {
    setOffset((num) => num + 10);
  };

  useEffect(() => {
    if (moreAvailable) {
      fetchRecipeList(offset);
    }
    //eslint-disable-next-line
  }, [offset]);
  return (
    <Box>
      <Grid
        container
        direction="row"
        spacing={2}
        alignContent="flex-start"
        alignItems="flex-start"
      >
        {recipes.map((rec, index) => (
          <RecipeCard
            recipe={rec}
            key={rec.ID}
            navigate={navigate}
            index={index}
          />
        ))}
      </Grid>
      {!loading && recipes.length === 0 ? (
        <Box py={30} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6">
            No recipes were found. Why dont you try making one:
          </Typography>
          <Box pt={5}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => navigate("/recipes/create")}
              disableElevation={true}
            >
              Create a recipe
            </Button>
          </Box>
        </Box>
      ) : null}
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : null}
      {moreAvailable ? (
        <Box display="flex" justifyContent="center" py={4} color="secondary">
          <Button onClick={increaseLimitAndFetch} variant="outlined">
            See more recipes
          </Button>
        </Box>
      ) : null}
    </Box>
  );
};

export default RecipeList;
