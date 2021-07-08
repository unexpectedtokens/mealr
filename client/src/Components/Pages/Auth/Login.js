import {
  Button,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChevronRight } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { Helmet } from "react-helmet";
import config from "../../../Config/config";

function Login({ classes, onAuthenticate }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/auth/obtain/`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        if (remember) {
          localStorage.setItem("username", credentials.username);
        }
        onAuthenticate(data);
      } else if (response.status === 401) {
        enqueueSnackbar("Incorrect credentials", { variant: "error" });
      } else if (response.status === 404) {
        enqueueSnackbar("No such user with that username", {
          variant: "error",
        });
      }
    } catch (e) {
      enqueueSnackbar("Something went wrong, please try again", {
        variant: "error",
      });
      console.log(e);
    }
    setLoading(false);
  };
  const onChangeCredentials = (e) => {
    const newCredentials = { ...credentials };
    newCredentials[e.target.id] = e.target.value;
    setCredentials(newCredentials);
  };
  useEffect(() => {
    if (credentials.username !== "" && credentials.password !== "") {
      setValid(true);
    }
  }, [credentials]);
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username != null) {
      setRemember(true);
      setCredentials((c) => ({ ...c, username }));
    }
  }, []);
  return (
    <>
      <Helmet>
        <title>Log in</title>
      </Helmet>
      <form
        onSubmit={onSubmit}
        method="POST"
        className={classes.form}
        noValidate
        autoComplete="off"
        key="2"
      >
        <Typography variant="h6">Log in to your account to continue</Typography>
        <TextField
          type="text"
          id="username"
          value={credentials["username"]}
          onChange={onChangeCredentials}
          fullWidth
          autoComplete="username"
          autoFocus
          margin="normal"
          variant="filled"
          label="username"
          disabled={loading}
        />
        <TextField
          label="password"
          type="password"
          variant="filled"
          id="password"
          value={credentials["password"]}
          onChange={onChangeCredentials}
          margin="normal"
          fullWidth
          autoComplete="current-password"
          disabled={loading}
        />
        <FormControlLabel
          control={
            <Checkbox
              value={remember}
              onChange={() => setRemember(!remember)}
              color="primary"
              disabled={loading}
            />
          }
          label="Remember me"
        />

        <Button
          margin="normal"
          onClick={onSubmit}
          variant="contained"
          color="primary"
          fullWidth
          className={classes.submit}
          endIcon={!loading ? <ChevronRight /> : null}
          disabled={!loading && !valid}
        >
          {loading ? (
            <CircularProgress size="1.5rem" color="inherit" />
          ) : (
            "Log in"
          )}
        </Button>
        <Button
          size="small"
          onClick={() => history.replace("/auth/create")}
          disabled={loading}
        >
          Make an account
        </Button>
      </form>
    </>
  );
}

export default Login;
