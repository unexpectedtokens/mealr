import { useEffect, useReducer } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import Layout from "./Layout";
//route imports
import Profile from "./AppPages/Profile/Index";
import MealPlanner from "./AppPages/MealPlanner/Index";
import HomeScreen from "./AppPages/Home/index";
import { CircularProgress } from "@material-ui/core";
import config from "../../../Config/config";
import Recipes from "./AppPages/Recipes/Index";
import { SnackbarProvider } from "notistack";
import About from "./AppPages/About/About";

const actionTypes = {
  setLoading: "setLoading",
  setUserInfo: "setUserInfo",
  setValidForMPG: "setValidForMPG",
  setAppRoute: "setAppRoute",
};

const actionCreators = {
  loadingActionCreator: (payload) => ({
    type: actionTypes.setLoading,
    payload,
  }),
  userInfoActionCreator: (payload) => ({
    type: actionTypes.setUserInfo,
    payload,
  }),
  validForMPGActionCreator: (payload) => ({
    type: actionTypes.setValidForMPG,
    payload,
  }),
  appRouteActionCreator: (payload) => ({
    type: actionTypes.setAppRoute,
    payload,
  }),
};

const initialState = {
  mainAppLoading: true,
  appRoute: "home",
  profileValForMPG: false,
  userInfo: {
    username: "",
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.setLoading:
      return { ...state, mainAppLoading: action.payload };
    case actionTypes.setUserInfo:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          username: action.payload,
        },
      };
    case actionTypes.setValidForMPG:
      return { ...state, profileValForMPG: action.payload };
    case actionTypes.setAppRoute:
      return { ...state, appRoute: action.payload };
    default:
      return state;
  }
};

function Main({ setAuth, auth, refreshOn404 }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [loading, setLoading] = useState(true)
  //const theme = useTheme();

  const { path } = useRouteMatch();
  const history = useHistory();
  const {
    loadingActionCreator,
    appRouteActionCreator,
    userInfoActionCreator,
    validForMPGActionCreator,
  } = actionCreators;
  const handleLogoutButtonPressed = () => {
    fetch(`${config.API_URL}/auth/logout/`, {
      method: "POST",
      headers: {
        Authorization: auth.Key,
      },
    });
    setAuth({
      isAuthenticated: false,
      Key: "",
    });
    localStorage.removeItem("Key");
    history.push("/auth/");
  };

  const goBack = () => {
    history.goBack();
  };

  const checkIfProfileValid = async (Key = auth.Key) => {
    try {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/profile/isvalid/`,
        "GET",
        "",
        Key
      );
      const data = await response.json();
      // console.log(data);
      dispatch(validForMPGActionCreator(data.Valid));
    } catch (e) {
      console.log(e);
    }
  };

  const handleAuthenticatedEndpointRequest = (
    endpoint,
    type,
    body = "",
    contentType = "application/json"
  ) => {
    console.log(
      `Attempting endpoint fetch at ${endpoint}, method: ${type}, with key ${
        auth.Key
      } content-type: ${contentType}, body: ${body ? body : ""}`
    );
    return new Promise(async (resolve, reject) => {
      try {
        const callParams = {
          method: type,
          headers: {
            Authorization: auth.Key,
          },
        };
        if (contentType === "application/json") {
          callParams.headers["Content-Type"] = contentType;
        }
        if (body) {
          callParams["body"] = body;
        }
        let response = await fetch(endpoint, callParams);
        // console.log(
        //   `returned status code from endpoint ${endpoint} hit attempt: `,
        //   response.status
        // );
        if (response.status === 401) {
          console.log(response.status);

          refreshOn404();
          return reject("unauthorized");
        }
        if (response.status === 400) {
          const data = await response.text();
          console.log(data);
          reject(response.status);
        }
        if (
          response.status === 200 ||
          response.status === 201 ||
          response.status === 404
        ) {
          return resolve(response);
        } else {
          throw new Error("bad request, status code: " + response.status);
        }
      } catch (e) {
        return reject(
          `something went wrong fetching endpoint: ${endpoint}: ${e}`
        );
      }
    });
  };
  // const refreshToken;

  const handleRouteChange = (url) => {
    history.push(`${path}${url}`);
  };

  const initialize = async () => {
    try {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/auth/retrieve/`,
        "GET"
      );
      const data = await response.json();
      // console.log("data:", data);

      dispatch(userInfoActionCreator(data.Username));
      dispatch(loadingActionCreator(false));
      checkIfProfileValid();
    } catch (e) {
      handleLogoutButtonPressed();
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      history.push("/auth/");
    } else {
      initialize();
    }
    //eslint-disable-next-line
  }, [auth.isAuthenticated, state.mainAppLoading, history]);
  return (
    <SnackbarProvider>
      <Layout
        handleLogoutButtonPressed={handleLogoutButtonPressed}
        handleRouteChange={handleRouteChange}
        appRoute={state.appRoute}
        auth={auth}
        goBack={goBack}
        userInfo={state.userInfo}
      >
        {state.mainAppLoading ? (
          <CircularProgress />
        ) : (
          <Switch>
            <Route
              path={`${path}/profile`}
              render={() => (
                <Profile
                  auth={auth}
                  navigate={handleRouteChange}
                  checkValidForMG={checkIfProfileValid}
                  userInfo={state.userInfo}
                  handleAuthenticatedEndpointRequest={
                    handleAuthenticatedEndpointRequest
                  }
                  validForMG={state.profileValForMPG}
                  setActiveRoute={(activeUrl) =>
                    dispatch(appRouteActionCreator(activeUrl))
                  }
                />
              )}
            />
            <Route
              path={`${path}/planner`}
              render={() => (
                <MealPlanner
                  auth={auth}
                  navigate={handleRouteChange}
                  validForMG={state.profileValForMPG}
                  setActiveRoute={(activeUrl) =>
                    dispatch(appRouteActionCreator(activeUrl))
                  }
                />
              )}
            />
            <Route
              path={`${path}/recipes`}
              render={() => (
                <Recipes
                  auth={auth}
                  navigate={handleRouteChange}
                  userInfo={state.userInfo}
                  handleAuthenticatedEndpointRequest={
                    handleAuthenticatedEndpointRequest
                  }
                  setActiveRoute={(activeUrl) =>
                    dispatch(appRouteActionCreator(activeUrl))
                  }
                />
              )}
            />
            <Route
              path={`${path}/about`}
              render={() => (
                <About
                  setActiveRoute={(activeUrl) =>
                    dispatch(appRouteActionCreator(activeUrl))
                  }
                />
              )}
            />
            <Route
              exact
              path={path}
              render={() => (
                <HomeScreen
                  userInfo={state.userInfo}
                  navigate={handleRouteChange}
                  validForMG={state.profileValForMPG}
                  loading={state.mainAppLoading}
                  setActiveRoute={(activeUrl) =>
                    dispatch(appRouteActionCreator(activeUrl))
                  }
                />
              )}
            />
          </Switch>
        )}
      </Layout>
    </SnackbarProvider>
  );
}

export default Main;
