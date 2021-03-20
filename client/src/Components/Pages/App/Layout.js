import {
  Box,
  Container,
  Grid,
  makeStyles,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItem,
  Button,
  Divider,
} from "@material-ui/core";
import {
  Home,
  PersonRounded as Person,
  Schedule,
  Settings,
  Fastfood,
} from "@material-ui/icons";
import Logo from "../../Reusables/Logo";
//import Logo from "../../../assets/images/logo.png";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  GreenBox: {
    backgroundColor: theme.palette.primary.main,
    width: `calc(100% - ${drawerWidth}px)`,
  },
  drawerPaper: {
    width: drawerWidth,
    border: "none",
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
  listItemIcon: {
    fontSze: "1rem",
  },
  drawerHeader: {
    color: theme.palette.primary.dark,
    fontStyle: "italic",
    fontWeight: "bold",
  },
}));

function Layout({
  appRoute,
  handleRouteChange,
  handleLogoutButtonPressed,
  children,
}) {
  const classes = useStyles();
  return (
    <Box flexGrow={1} pl={`${drawerWidth}px`}>
      <Box
        position="absolute"
        color="primary"
        height="20%"
        zIndex={-1}
        className={classes.GreenBox}
        top={0}
      />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Box
          p={2}
          pt={4}
          display="flex"
          mb={2}
          alignItems="center"
          justifyContent="center"
        >
          {/* <img src={Logo} alt="logo" width="50" /> */}
          <Logo />
        </Box>
        <Grid
          container
          direction="column"
          justify="space-between"
          alignItems="stretch"
        >
          <Grid item xs={12}>
            <List>
              {[
                { url: "/", label: "Home" },
                { url: "/planner", label: "Meal Planner" },
                { url: "/recipes", label: "Recipes" },
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
                      className={`${active ? classes.activeListItemIcon : ""} ${
                        classes.ListItemIcon
                      }`}
                    >
                      {index === 0 ? <Home fontSize="small" /> : null}
                      {index === 1 ? <Schedule fontSize="small" /> : null}
                      {index === 2 ? <Fastfood fontSize="small" /> : null}
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
            <Divider light />
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
                      {index === 0 ? <Person fontSize="small" /> : null}
                      {index === 1 ? <Settings fontSize="small" /> : null}
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
              <Button fullWidth onClick={handleLogoutButtonPressed}>
                Log out
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Drawer>
      <Container maxWidth="md">
        <Box pt={20}>{children}</Box>
      </Container>
    </Box>
  );
}

export default Layout;
