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
    setAuth({ isAuthenticated: false, authInfo: { Key: "" } });
  };
  const fetchUserCreds = async () => {
    const response = await fetch(`${config.API_URL}/auth/retrieve/`, {
      method: "GET",
      headers: {
        Authorization: auth.authInfo.Key,
      },
    });
    const data = await response.json();
    setAuth((cur) => ({
      ...cur,
      authInfo: { ...cur.authInfo, email: data.Email, username: data.Username },
    }));
  };
  const handleRouteChange = (url) => {
    history.push(`${path}${url}`);
    setAppRoute(url);
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      setLoading(false);
    }
  }, [auth.isAuthenticated]);
  useEffect(() => {
    fetchUserCreds();
    //eslint-disable-next-line
  }, []);
  return (
    <Layout
      handleLogoutButtonPressed={handleLogoutButtonPressed}
      handleRouteChange={handleRouteChange}
      appRoute={appRoute}
    >
      {!loading ? (
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
