import Layout from "./Components/Layout";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Auth from "./Components/Pages/Auth/";
import Landing from "./Components/Pages/Landing";
import Main from "./Components/Pages/App/Index";
import { /*useEffect,*/ useState } from "react";
function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    Key: "",
  });

  // useEffect(() => {
  //   const Key = localStorage.getItem("Key");
  //   if (Key != null) {
  //     setAuth({ isAuthenticated: true, authInfo: { Key } });
  //   }
  // }, []);
  return (
    <Router basename="/site">
      <Layout>
        <Switch>
          <Route
            path="/auth"
            render={() => <Auth auth={auth} setAuth={setAuth} />}
          />
          <Route
            path="/app"
            render={() => <Main setAuth={setAuth} auth={auth} />}
          />
          <Route path="/" render={() => <Landing />} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;
