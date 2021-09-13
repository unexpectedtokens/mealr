import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Route, Switch, useRouteMatch } from "react-router";
import config from "../../../../../Config/config";
import ProfileEdit from "./Edit";
import ProfileLanding from "./Landing";
import { useQuery } from "react-query";
import { CircularProgress } from "@material-ui/core";
import { useHistory } from "react-router";
import { useSnackbar } from "notistack";

function Profile({
  auth,
  setActiveRoute,
  handleAuthenticatedEndpointRequest,
  validForMG,
  checkValidForMG,
  userInfo,
}) {
  const { path } = useRouteMatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const fetchProfile = async () => {
    try {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/profile/`,
        "GET"
      );
      return response.json();
    } catch (e) {
      console.log("Something went wrong fetching profile:", e);
      throw new Error(e);
    }
  };
  const { data, isLoading, refetch, isError } = useQuery(
    ["profile"],
    fetchProfile
  );

  useEffect(() => {
    setActiveRoute("profile");
    //eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (isError && !isLoading) {
      enqueueSnackbar(
        "something went wrong fetching your profile info. Please try again later"
      );
      history.goBack();
    }
  }, [isError, isLoading, history, enqueueSnackbar]);

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <Switch>
        {!isLoading ? (
          <>
            <Route
              path={`${path}`}
              exact
              render={() => (
                <ProfileLanding
                  data={data}
                  userInfo={userInfo}
                  validForMG={validForMG}
                  path={path}
                />
              )}
            />
            <Route
              path={`${path}/edit`}
              render={() => (
                <ProfileEdit
                  profile={data}
                  path={path}
                  refetch={refetch}
                  auth={auth}
                  validForMG={validForMG}
                  checkValidForMG={checkValidForMG}
                  handleAuthenticatedEndpointRequest={
                    handleAuthenticatedEndpointRequest
                  }
                />
              )}
            />
          </>
        ) : (
          <CircularProgress />
        )}
      </Switch>
    </>
  );
}

export default Profile;
