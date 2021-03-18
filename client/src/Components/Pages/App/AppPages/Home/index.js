import {
  Box,
  Card,
  CircularProgress,
  Grow,
  Paper,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import config from "../../../../../Config/config";

function Home({ auth, navigate }) {
  const [profileValid, setProfileValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkIfProfileValid = async () => {
    const response = await fetch(`${config.API_URL}/api/profile/isvalid/`, {
      method: "GET",
      headers: { Authorization: auth.authInfo.Key },
    });
    const data = await response.json();
    setProfileValid(data.Valid);
    setLoading(false);
  };

  useEffect(() => {
    checkIfProfileValid();
    //eslint-disable-next-line
  }, []);

  return (
    <>
      {!loading ? (
        <Box display="flex" flexDirection="column">
          {!profileValid ? (
            <Grow in={!profileValid}>
              <Card>
                <Box p={2}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary"
                      style={{ fontWeight: "bold" }}
                    >
                      Your profile is not complete.
                    </Typography>
                    <Typography>
                      You need to complete it before you can generate a personal
                      mealplan
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ fontWeight: "bold" }}
                      onClick={() => navigate("/profile")}
                    >
                      Complete Profile
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            </Grow>
          ) : null}
          <Box py={2}>
            <Paper>
              <Box p={2}>
                <Typography variant="h4">
                  Welcome{" "}
                  {auth.authInfo.username !== "" ? (
                    <>
                      {auth.authInfo.username[0].toUpperCase() +
                        auth.authInfo.username.slice(
                          1,
                          auth.authInfo.username.length
                        )}
                    </>
                  ) : null}
                </Typography>
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
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}
    </>
  );
}

export default Home;
