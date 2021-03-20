import { Box, Grow, Paper, Typography, Grid } from "@material-ui/core";
import PNC from "../../../../Reusables/App/ProfileNotComplete";

function Home({ navigate, validForMG, loading, userInfo }) {
  return (
    <>
      <Box display="flex" flexDirection="column">
        {!validForMG ? <PNC navigate={navigate} show={!validForMG} /> : null}
        <Box py={2}>
          <Paper>
            <Box p={2}>
              {!loading ? (
                <Typography variant="h4">
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
          </Paper>
        </Box>
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
