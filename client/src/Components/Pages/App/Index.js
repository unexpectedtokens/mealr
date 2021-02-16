import {
  Box,
  Container,
  Drawer,
  makeStyles,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Button,
} from "@material-ui/core";
import {
  Home,
  PersonRounded as Person,
  Schedule,
  Settings,
} from "@material-ui/icons";
import { useState } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";

//route imports
import Profile from "./AppPages/Profile/Index";
import MealPlanner from "./AppPages/MealPlanner/Index";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  listItem: {
    backgroundColor: "#fff",
    borderRight: `2px solid #fff`,
    "&:hover": {
      backgroundColor: "#eee",
    },
  },
  listItemText: {
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: "1rem",
    transition: theme.transitions.easing.easeIn,
  },
  activeListItemText: {
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: "1rem",
    color: theme.palette.primary.main,
  },
  activeListItem: {
    borderRight: `4px solid ${theme.palette.primary.main}`,
  },
  activeListItemIcon: {
    color: theme.palette.primary.main,
  },
}));

function Main({ setAuth }) {
  const [appRoute, setAppRoute] = useState("/");
  // const [loading, setLoading] = useState(true)
  //const theme = useTheme();
  const classes = useStyles();
  const { path } = useRouteMatch();
  const history = useHistory();

  const handleLogoutButtonPressed = () => {
    setAuth({ isAuthenticated: false, authInfo: { Key: "" } });
  };

  const handleRouteChange = (url) => {
    history.push(`${path}${url}`);
    setAppRoute(url);
    console.log(appRoute, url);
  };

  return (
    <Box flexGrow={1} height="300vh">
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="stretch"
          >
            <Grid item xs={12}>
              {/* <Box
            display="flex"
            width="100%"
            justifyContent="start"
            pl="1rem"
            alignItems="center"
          >
            <Home color="primary" />
            <Typography>Okay Chef</Typography>
          </Box> */}
              {/* <Box pl="1rem" pt="1rem">
            <Typography>General</Typography>
          </Box> */}
              <List>
                {[
                  { url: "/", label: "Home" },
                  { url: "/planner", label: "Meal Planner" },
                ].map((link, index) => {
                  const active = link.url === appRoute;
                  return (
                    <ListItem
                      button
                      key={link.label}
                      onClick={() => handleRouteChange(link.url)}
                      className={
                        active ? classes.activeListItem : classes.ListItem
                      }
                    >
                      <ListItemIcon
                        className={active ? classes.activeListItemIcon : null}
                      >
                        {index === 0 ? <Home /> : null}
                        {index === 1 ? <Schedule /> : null}
                      </ListItemIcon>
                      <ListItemText
                        classes={{
                          primary: active
                            ? classes.activeListItemText
                            : classes.listItemText,
                        }}
                        primary={link.label}
                      />
                    </ListItem>
                  );
                })}
              </List>
              {/* <Box pl={theme.spacing(0.5)} pt={theme.spacing(0.5)}>
            <Typography>User</Typography>
          </Box> */}
              <List>
                {[
                  { url: "/profile", label: "My Profile" },
                  { url: "/settings", label: "Settings" },
                ].map((link, index) => {
                  const active = link.url === appRoute;
                  return (
                    <ListItem
                      button
                      key={link.label}
                      onClick={() => handleRouteChange(link.url)}
                      className={
                        active ? classes.activeListItem : classes.ListItem
                      }
                    >
                      <ListItemIcon
                        className={active ? classes.activeListItemIcon : null}
                      >
                        {index === 0 ? <Person /> : null}
                        {index === 1 ? <Settings /> : null}
                      </ListItemIcon>
                      <ListItemText
                        classes={{
                          primary: active
                            ? classes.activeListItemText
                            : classes.listItemText,
                        }}
                        primary={link.label}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Grid>
            <Grid item>
              <Box p={5}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleLogoutButtonPressed}
                >
                  Log out
                </Button>
              </Box>
            </Grid>
          </Grid>
        </div>
      </Drawer>
      <Container
        maxWidth="md"
        style={{ paddingLeft: drawerWidth, paddingTop: 50 }}
      >
        <Switch>
          <Route path={`${path}/profile`} render={() => <Profile />} />
          <Route path={`${path}/planner`} render={() => <MealPlanner />} />
          <Route exact path={path}>
            <h1>HOME</h1>
          </Route>
        </Switch>
      </Container>
    </Box>
  );
}

export default Main;
