import Layout from "./Components/Layout";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Auth from "./Components/Pages/Auth/";
import Landing from "./Components/Pages/Landing";
import Main from "./Components/Pages/App/Index";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import config from "./Config/config";

const client = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    Key: "",
  });

  const refreshToken = (Key = auth.Key) => {
    //console.log("attemtping refresh with", Key);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${config.API_URL}/auth/refresh/`, {
          method: "POST",
          headers: {
            Authorization: Key,
          },
        });
        if (response.status !== 200) {
          throw new Error("not authorized");
        }
        const data = await response.json();
        //console.log("refresh succesful, key:", data.Key);
        return resolve(data.Key);
      } catch (e) {
        return reject("not authorized");
      }
    });
  };

  const attemptRefreshOrReAuth = async (Key = auth.Key) => {
    if (!loading) {
      setLoading(true);
    }
    try {
      const newKey = await refreshToken(Key);
      setTimeout(() => {
        attemptRefreshOrReAuth(newKey);
      }, 3300000);
      //console.log("newkey:", newKey);
      localStorage.setItem("Key", newKey);
      setAuth({ isAuthenticated: true, Key: newKey });
      setLoading(false);
    } catch (e) {
      console.log(e);
      if (auth.isAuthenticated) {
        setAuth({ isAuthenticated: false, Key: "" });
      }
      localStorage.removeItem("Key");
      setLoading(false);
    }
  };
  //console.log(auth);
  useEffect(() => {
    const Key = localStorage.getItem("Key");
    if (Key != null) {
      attemptRefreshOrReAuth(Key);
    } else {
      setLoading(false);
    }
    //eslint-disable-next-line
  }, []);
  return (
    <QueryClientProvider client={client}>
      <Router basename="/site">
        <Helmet>
          <title>Lembas</title>
        </Helmet>
        <Layout>
          {!loading ? (
            <Switch>
              <Route
                path="/auth"
                render={() => (
                  <Auth auth={auth} setAuth={setAuth} loading={loading} />
                )}
              />
              <Route
                path="/app"
                render={() => (
                  <Main
                    setAuth={setAuth}
                    auth={auth}
                    refreshOn404={attemptRefreshOrReAuth}
                  />
                )}
              />
              <Route path="/" render={() => <Landing />} />
            </Switch>
          ) : null}
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
