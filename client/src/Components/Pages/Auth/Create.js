import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import config from "../../../Config/config";
import { ChevronRight } from "@material-ui/icons";

const validateCredentials = (credentials) => {
  const creds = { ...credentials };
  Object.keys(credentials).forEach((item) => {
    const cred = { ...credentials[item] };
    if (cred.value.length < cred.validation.minLength) {
      cred.error = {
        ex: true,
        text: `${cred.label} needs to be at least ${cred.validation.minLength} characters`,
      };
      creds[item] = cred;
      return;
    } else {
      cred.error = {
        ex: false,
        text: "",
      };
      creds[item] = cred;
    }

    if (item === "password-confirm") {
      if (credentials[item].value !== credentials["password"].value) {
        cred.error = { ex: true, text: "Passwords do not match" };
      }
    }
  });
  return creds;
};

function Create({ classes, loading, setLoading, onAuthenticate }) {
  const [valid, setValid] = useState(false);
  const [credentials, setCredentials] = useState({
    email: {
      value: "",
      type: "email",
      label: "Email",
      validation: { minLength: 4 },
      error: { ex: false, text: "" },
    },
    username: {
      type: "text",
      label: "Username",
      value: "",
      validation: { minLength: 10 },
      error: { ex: false, text: "" },
    },
    password: {
      value: "",
      label: "Password",
      type: "password",
      validation: { minLength: 6 },
      error: { ex: false, text: "" },
    },
    "password-confirm": {
      value: "",
      label: "Confirm password",
      type: "password",
      error: { ex: false, text: "" },
      validation: {
        minLength: 6,
      },
    },
  });
  const history = useHistory();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (valid) {
      setLoading(true);
      const body = {
        email: credentials.email.value,
        username: credentials.username.value,
        password: credentials.password.value,
      };
      try {
        const response = await fetch(`${config.API_URL}/auth/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (response.status === 200) {
          const data = await response.json();
          onAuthenticate(data);
          setLoading(false);
        } else if (response.status === 302) {
          const data = await response.text();
          const ae = data.split(" ")[0];
          const newCredentials = { ...credentials };
          newCredentials[ae] = {
            ...newCredentials[ae],
            error: { ex: true, text: data },
          };
          setCredentials(newCredentials);
          setLoading(false);
        }
      } catch (e) {
        console.log(e.status);
        setLoading(false);
      }
    }
  };
  //Function that changes the state whenever the user types in an input. The related field gets updated
  const onChangeCredentials = (e) => {
    const newCredentials = { ...credentials };
    newCredentials[e.target.id].value = e.target.value;
    setCredentials(newCredentials);
  };

  useEffect(() => {
    const checkedCredentials = validateCredentials(credentials);
    let valid = true;
    Object.keys(checkedCredentials).forEach((item) => {
      setValid(!credentials[item].error.ex && valid);
    });
    setValid(valid);
  }, [credentials]);

  return (
    <form
      onSubmit={onSubmit}
      method="POST"
      className={classes.form}
      noValidate
      autoComplete="off"
      key="1"
    >
      <Typography variant="h6">Create an account to continue</Typography>
      {Object.keys(credentials).map((item) => {
        return (
          <TextField
            key={item}
            type={credentials[item].type}
            value={credentials[item].value}
            fullWidth
            id={item}
            variant="filled"
            label={credentials[item].label}
            margin="normal"
            onChange={onChangeCredentials}
            autoFocus={credentials[item].type === "email"}
            disabled={loading}
            error={credentials[item].error.ex}
            helperText={credentials[item].error.text}
          />
        );
      })}
      <div className={classes.buttonContainer}>
        <Button
          margin="normal"
          onClick={onSubmit}
          variant="contained"
          color="primary"
          fullWidth
          className={classes.submit}
          endIcon={!loading ? <ChevronRight /> : null}
        >
          {loading ? (
            <CircularProgress size="1.5rem" color="secondary" />
          ) : (
            "Create Account"
          )}
        </Button>
        <Button size="small" onClick={() => history.replace(`/auth`)}>
          Log in to existing account
        </Button>
      </div>
    </form>
  );
}

export default Create;
