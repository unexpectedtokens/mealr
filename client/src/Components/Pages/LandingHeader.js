import {
  Typography,
  Button,
  Box,
  makeStyles,
  Grid,
  Hidden,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import config from "../../Config/config";
import RecImg from "./LandingHeaderRecImage";

const useStyles = makeStyles((theme) => ({
  GridContainer: {
    height: "calc(100vh - 80px)",
    [theme.breakpoints.down("md")]: {
      alignItems: "flex-start",
      flexDirection: "column",
    },
    [theme.breakpoints.up("md")]: {
      alignItems: "center",
      flexDirection: "row",
    },
    [theme.breakpoints.down("sm")]: {
      paddingTop: "5rem",
    },
  },
  GetStarted: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    padding: "0.7rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
  Header: {
    fontSize: "4rem",
    fontWeight: "bolder",
    color: theme.palette.grey[900],
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.5rem",
    },
  },
  SubHeader: {
    fontWeight: "bold",
    fontSize: "1rem",
    color: theme.palette.grey[500],
  },
  ImageGrid: {
    overflow: "hidden",
  },
  GridImage: {
    width: "100%",
  },
}));

function LandingHeader(props) {
  const classes = useStyles();

  const [recipes, setRecipes] = useState([]);
  const getRecipes = async () => {
    const response = await fetch(`${config.API_URL}/api/recipes/list/?limit=5`);
    const data = await response.json();
    setRecipes(data);
  };

  useEffect(() => getRecipes(), []);
  return (
    <Grid container justify="space-evenly" className={classes.GridContainer}>
      <Grid item lg={6} md={6} sm={6} xs={8}>
        <Box pb={3}>
          <Typography variant="h1" className={classes.Header}>
            Reach your health goals by generating the perfect mealplan
          </Typography>
        </Box>
        <Box pb={3}>
          <Typography className={classes.SubHeader}>
            When you know exactly how much and what you should eat, reaching
            your goals becomes a piece of cake
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          className={classes.GetStarted}
          onClick={props.navigate}
        >
          Get started
        </Button>
      </Grid>

      <Hidden mdDown>
        <Grid
          item
          container
          lg={6}
          md={6}
          spacing={0}
          alignContent="flex-start"
          alignItems="flex-start"
          className={classes.ImageGrid}
        >
          {recipes.map((rec) => (
            <RecImg
              src={rec.ImageURL}
              className={classes.GridImage}
              key={rec.ID}
              alt={rec.Title}
            />
          ))}
        </Grid>
      </Hidden>
    </Grid>
  );
}

export default LandingHeader;
