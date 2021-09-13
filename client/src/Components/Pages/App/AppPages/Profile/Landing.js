import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { Edit } from "@material-ui/icons";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  profileContainer: {
    overflow: "hidden",
  },
  mainInfoContainer: {
    transform: "translateY(-10%)",
  },
  banner: {
    background: theme.palette.primary.main,
    width: "100%",
    minHeight: 100,
  },
  name: {
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h4.fontSize,
  },
  buttonWeight: {
    fontWeight: 700,
  },
}));

const ProfileLanding = ({ data, userInfo, validForMG, path }) => {
  const classes = useStyles();
  const history = useHistory();
  const getDate = () => {
    const birthdate = new Date(data.Dob);
    if (birthdate.getFullYear() <= 1900) {
      return "unspecified";
    }
    const birthyear = birthdate.getFullYear();
    const birthmonth = birthdate.getMonth() + 1;

    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    let age = curYear - birthyear;
    if (curMonth < birthmonth) {
      age--;
    }
    return age;
  };
  return (
    <Container maxWidth="md">
      <Paper className={classes.profileContainer}>
        <Box className={classes.banner} />
        <Paper className={classes.mainInfoContainer} elevation={0}>
          <Box p={3} pb={1}>
            <Box py={1}>
              <Typography className={classes.name}>
                {userInfo.username[0].toUpperCase() +
                  userInfo.username.slice(1, userInfo.username.length)}
              </Typography>
            </Box>
            <Grid container justify="flex-start" alignItems="center">
              <Grid item>
                <Typography>
                  Height:{" "}
                  <Typography className={classes.buttonWeight} component="span">
                    {data.Height ? data.Height : "unspecified"}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item>
                <Box px={1}>
                  <Typography variant="h5" component="span">
                    &#8226;
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Typography>
                  Weight:{" "}
                  <Typography className={classes.buttonWeight} component="span">
                    {data.Weight ? data.Weight : "unspecified"}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item>
                <Box px={1}>
                  <Typography variant="h5" component="span">
                    &#8226;
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Typography>
                  Age:{" "}
                  <Typography component="span" className={classes.buttonWeight}>
                    {getDate()}
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
            <Box>
              <Typography>
                Level of activity:{" "}
                <Typography className={classes.buttonWeight} component="span">
                  {data.Loa}
                </Typography>
              </Typography>
            </Box>
            <Box pt={3} display="flex" justifyContent="flex-end">
              <Button
                startIcon={<Edit />}
                color="primary"
                variant="contained"
                className={classes.buttonWeight}
                onClick={() => history.replace(`${path}/edit`)}
              >
                Edit profile
              </Button>
            </Box>
            <Box pt={2}>
              <Card>
                <Box p={2}>
                  <Typography variant="body1">
                    {validForMG
                      ? "Your profile is ready for mealplan generation"
                      : "Your profile is not yet ready for mealplan generation"}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>
        </Paper>
      </Paper>
      <Box pt={2}>
        <Paper>
          <Box p={2}>
            <Typography variant="h5">Your recipes:</Typography>
            <Typography>You have not yet created any recipes.</Typography>
            <Grid container></Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileLanding;
