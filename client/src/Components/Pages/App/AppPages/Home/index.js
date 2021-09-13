import {
  Box,
  Grow,
  Paper,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import PNC from "../../../../Reusables/App/ProfileNotComplete";

const useStyles = makeStyles((theme) => ({
  bannerText: {
    color: theme.palette.grey[900],
    fontWeight: 600,
    fontSize: "3em",
  },
}));

function Home({ navigate, validForMG, loading, userInfo, setActiveRoute }) {
  const classes = useStyles();
  useEffect(() => {
    setActiveRoute("home");
    //eslint-disable-next-line
  }, []);
  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <Box display="flex" flexDirection="column">
        <Box py={2}>
          <Box p={2} pl={0}>
            {!loading ? (
              <Typography variant="h2" className={classes.bannerText}>
                Welcome{" "}
                {userInfo.username !== "" ? (
                  <>
                    {userInfo.username[0].toUpperCase() +
                      userInfo.username.slice(1, userInfo.username.length)}
                  </>
                ) : null}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {!validForMG ? <PNC navigate={navigate} show={!validForMG} /> : null}

        <Box flex={1} pt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <Grow in={true}>
                <Paper elevation={1}>
                  <Box p={2}>
                    <p>Hello</p>
                  </Box>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} lg={4} md={6}>
              <Grow in={true}>
                <Paper elevation={1}>
                  <Box p={2}>ello</Box>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} lg={4} md={6}>
              <Grow in={true}>
                <Paper elevation={1}>
                  <Box p={2}>ello</Box>
                </Paper>
              </Grow>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default Home;
