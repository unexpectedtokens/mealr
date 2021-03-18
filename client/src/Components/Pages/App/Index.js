import { useEffect, useState } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import Layout from "./Layout";
//route imports
import Profile from "./AppPages/Profile/Index";
import MealPlanner from "./AppPages/MealPlanner/Index";
import HomeScreen from "./AppPages/Home/index";
import { CircularProgress } from "@material-ui/core";
import config from "../../../Config/config";
import Recipes from "./AppPages/Recipes/Index";

function Main({ setAuth, auth }) {
  const [appRoute, setAppRoute] = useState("/");
  const [loading, setLoading] = useState(true);

  // const [loading, setLoading] = useState(true)
  //const theme = useTheme();

  const { path } = useRouteMatch();
  const history = useHistory();

  const handleLogoutButtonPressed = () => {
    localStorage.removeItem("Key");
    setLoading(true);
  };
  const fetchUserCreds = async (Key) => {
    try {
      const response = await fetch(`${config.API_URL}/auth/retrieve/`, {
        method: "GET",
        headers: {
          Authorization: Key,
        },
      });
      const data = await response.json();
      setAuth((cur) => ({
        ...cur,
        isAuthenticated: true,
        authInfo: {
          ...cur.authInfo,
          email: data.Email,
          username: data.Username,
          Key,
        },
      }));
      setLoading(false);
    } catch (e) {
      console.log(e);
      localStorage.removeItem("Key");
      setLoading(false);
      setAuth({ isAuthenticated: false, authInfo: { Key: "" } });
    }
  };
  const handleRouteChange = (url) => {
    history.push(`${path}${url}`);
    setAppRoute(url);
  };
  useEffect(() => {
    if (loading) {
      const Key = localStorage.getItem("Key");
      if (Key !== null) {
        fetchUserCreds(Key);
      } else {
        setAuth({ isAuthenticated: false, authInfo: { Key: "" } });
        setLoading(false);
      }
    }
    //eslint-disable-next-line
  }, [loading]);
  useEffect(() => {
    if (!auth.isAuthenticated && !loading) {
      history.push("/auth/");
    }
  }, [auth.isAuthenticated, loading, history]);
  return (
    <Layout
      handleLogoutButtonPressed={handleLogoutButtonPressed}
      handleRouteChange={handleRouteChange}
      appRoute={appRoute}
      auth={auth}
    >
      {!loading || !auth.isAuthenticated ? (
        <Switch>
          <Route
            path={`${path}/profile`}
            render={() => <Profile auth={auth} navigate={handleRouteChange} />}
          />
          <Route
            path={`${path}/planner`}
            render={() => (
              <MealPlanner auth={auth} navigate={handleRouteChange} />
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
              <HomeScreen auth={auth} navigate={handleRouteChange} />
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
