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
  appRoute: "/",
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

function Main({ setAuth, auth }) {
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
    localStorage.removeItem("Key");
    dispatch(actionCreators.loadingActionCreator(false));
  };

  const checkIfProfileValid = async (Key) => {
    console.log("[checkProfileValid]: ", Key);
    try {
      const response = await fetch(`${config.API_URL}/api/profile/isvalid/`, {
        method: "GET",
        headers: { Authorization: Key },
      });
      const data = await response.json();

      dispatch(validForMPGActionCreator(data.Valid));
      dispatch(loadingActionCreator(false));
    } catch (e) {
      dispatch(loadingActionCreator(false));
    }
  };

  const fetchUserCreds = async (Key) => {
    console.log("[fetchUserCreds]: ", Key);
    try {
      const response = await fetch(`${config.API_URL}/auth/retrieve/`, {
        method: "GET",
        headers: {
          Authorization: Key,
        },
      });
      const data = await response.json();
      setAuth(() => ({
        isAuthenticated: true,
        Key,
      }));
      dispatch(userInfoActionCreator(data.Username));
      checkIfProfileValid(Key);
      dispatch(loadingActionCreator(false));
    } catch (e) {
      localStorage.removeItem("Key");
      setAuth({ isAuthenticated: false, Key: "" });
      dispatch(loadingActionCreator(false));
    }
  };
  const handleRouteChange = (url) => {
    history.push(`${path}${url}`);
    dispatch(appRouteActionCreator(url));
  };
  useEffect(() => {
    if (state.mainAppLoading) {
      const Key = localStorage.getItem("Key");
      if (Key !== null) {
        fetchUserCreds(Key);
      } else {
        setAuth({ isAuthenticated: false, Key: "" });
        dispatch(loadingActionCreator(false));
      }
    }
    //eslint-disable-next-line
  }, [state.mainAppLoading]);
  useEffect(() => {
    if (!auth.isAuthenticated && !state.mainAppLoading) {
      history.push("/auth/");
    }
  }, [auth.isAuthenticated, state.mainAppLoading, history]);
  return (
    <Layout
      handleLogoutButtonPressed={handleLogoutButtonPressed}
      handleRouteChange={handleRouteChange}
      appRoute={state.appRoute}
      auth={auth}
    >
      {!state.mainAppLoading || !auth.isAuthenticated ? (
        <Switch>
          <Route
            path={`${path}/profile`}
            render={() => (
              <Profile
                auth={auth}
                navigate={handleRouteChange}
                checkValidForMG={checkIfProfileValid}
                validForMG={state.profileValForMPG}
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
              />
            )}
          />
          <Route
            path={`${path}/recipes`}
            render={() => <Recipes navigate={handleRouteChange} />}
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
              />
            )}
          />
        </Switch>
      ) : (
        <CircularProgress />
      )}
    </Layout>
  );
}

export default Main;
