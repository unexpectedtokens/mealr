import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import Login from "./Login";
import Create from "./Create";
import { Box, Grid, makeStyles } from "@material-ui/core";
import { useEffect, useState } from "react";
import Logo from "../../Reusables/Logo";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    // display: "flex",
    // flexDirection: "column",
    padding: theme.spacing(10, 5),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "start",
  },
  greenBox: {
    backgroundColor: theme.palette.primary.dark,
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    flex: 1,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    color: theme.palette.white,
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: theme.palette.primary.main,
    "&hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  authContainer: {
    minHeight: "100vh",
    flex: 1,
  },
  authHeader: {
    fontSize: "3rem",
    fontStyle: "italic",
  },
}));

function Auth({ auth, setAuth }) {
  const [loading, setLoading] = useState(false);
  const { path } = useRouteMatch();
  const classes = useStyles();
  const history = useHistory();
  const onAuthenticate = (data) => {
    localStorage.setItem("Key", data.Key);
    setAuth({ isAuthenticated: true, Key: data.Key });
  };
  const checkIfAuth = () => {
    if (auth.isAuthenticated) {
      return true;
    }
    const Key = localStorage.getItem("Key");
    if (Key !== null) {
      setAuth({ isAuthenticated: true, Key });
      return true;
    }
  };

  useEffect(() => {
    if (checkIfAuth()) {
      history.push("/app/");
    }
    //eslint-disable-next-line
  });

  return (
    <Grid container justify="space-evenly" className={classes.authContainer}>
      <Box py={10}>
        <Logo />
        <Box pt={3} />
        <Switch basepath>
          <Route path={`${path}/create`}>
            <Create
              onAuthenticate={onAuthenticate}
              classes={classes}
              loading={loading}
              setLoading={setLoading}
            />
          </Route>
          <Route exact path={`${path}`}>
            <Login
              onAuthenticate={onAuthenticate}
              classes={classes}
              loading={loading}
              setLoading={setLoading}
            />
          </Route>
        </Switch>
      </Box>
    </Grid>
  );
}

export default Auth;
