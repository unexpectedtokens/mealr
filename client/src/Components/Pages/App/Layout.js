import {
  Box,
  Grid,
  makeStyles,
  Button,
  useTheme,
  useMediaQuery,
  Toolbar,
  IconButton,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import {
  HomeOutlined,
  ScheduleOutlined,
  ExitToAppOutlined,
  FastfoodOutlined,
  AccountCircleOutlined,
  Close,
  InfoOutlined,
  MenuOutlined,
  ChevronLeftOutlined,
} from "@material-ui/icons";
import Logo from "../../Reusables/Logo";

const useStyles = makeStyles((theme) => ({
  "@keyframes navbutSlideIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(-50%)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  MainContainer: {
    width: "100%",
    minHeight: "95vh",
    backgroundColor: theme.palette.primary.contrastText,
    maxWidth: theme.breakpoints.values.xl,
    [theme.breakpoints.up("lg")]: {
      boxShadow: theme.shadows[3],
      overflow: "hidden",
      borderRadius: theme.shape.borderRadius,
    },
    [theme.breakpoints.down("md")]: {
      height: "100vh",
    },
  },
  Nav: {
    backgroundColor: theme.palette.primary.contrastText,
    maxHeight: "100vh",
    height: "100%",
    padding: "2rem 1rem",
    zIndex: 1001,
  },
  DrawerGridItem: {
    zIndex: 1000,
    borderRight: "1px solid #eee",
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
      height: "100%",
      width: "100vw",
    },
  },
  MainScreenNav: {
    width: "100%",
    display: "flex",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
    position: "absolute",
    padding: "2rem 1rem",
    top: 0,
    left: 0,
    "& > div": {
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
    },
  },
  MenuOpenButton: {
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  SiteBody: {
    background: `linear-gradient(to bottom right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    [theme.breakpoints.up("lg")]: {
      padding: theme.spacing(2),
    },
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
  },
  NavButton: {
    marginBottom: theme.spacing(3),
    fontWeight: 500,
    animation: `$navbutSlideIn .5s ${theme.transitions.easing.easeIn}`,
  },
}));

function Layout({
  appRoute,
  handleRouteChange,
  handleLogoutButtonPressed,
  children,
  goBack,
  userInfo,
}) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  return (
    <Box className={classes.SiteBody}>
      <Grid container className={classes.MainContainer}>
        <Grid
          item
          xl={2}
          lg={2}
          md={3}
          style={{
            right: smallScreen && sideNavOpen ? 0 : "100%",
          }}
          className={classes.DrawerGridItem}
        >
          <Box display="flex" flexDirection="column" className={classes.Nav}>
            <Box
              display="flex"
              justifyContent={smallScreen ? "space-between" : "center"}
              alignItems="center"
            >
              {smallScreen ? (
                <IconButton onClick={() => setSideNavOpen(false)}>
                  <Close />
                </IconButton>
              ) : null}
              <Box pr={smallScreen ? 5 : 0}>
                <Logo
                  dark
                  orientation={smallScreen ? "vertical" : "horizontal"}
                />
              </Box>
              {smallScreen ? <Box> </Box> : null}
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              mt={10}
              flexGrow={1}
              alignSelf="stretch"
            >
              {[
                {
                  url: "/",
                  label: "Home",
                  activeHook: "home",
                  startIcon: <HomeOutlined />,
                },
                {
                  url: "/planner",
                  label: "Meal Planner",
                  activeHook: "meal planner",
                  startIcon: <ScheduleOutlined />,
                },
                {
                  url: "/recipes",
                  label: "Recipes",
                  activeHook: "recipes",
                  startIcon: <FastfoodOutlined />,
                },
                {
                  url: "/profile",
                  label: "My Profile",
                  activeHook: "profile",
                  startIcon: <AccountCircleOutlined />,
                },
                {
                  url: "/about",
                  label: "About This App",
                  activeHook: "about",
                  startIcon: <InfoOutlined />,
                },
              ].map((link, index) => {
                const active = link.activeHook === appRoute;
                return (
                  <Button
                    key={index * 2}
                    size="large"
                    fullWidth
                    variant={active ? "contained" : "text"}
                    color={active ? "primary" : "default"}
                    className={classes.NavButton}
                    startIcon={link.startIcon}
                    disableElevation
                    onClick={() => {
                      handleRouteChange(link.url, link.activeHook);
                      if (smallScreen) setSideNavOpen(false);
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
            <Box pb={2}>
              <Typography align="center">
                Logged in as{" "}
                <Typography component="span" color="primary">
                  {userInfo.username}
                </Typography>
              </Typography>
            </Box>
            <Button
              onClick={handleLogoutButtonPressed}
              startIcon={<ExitToAppOutlined />}
            >
              Log out
            </Button>
          </Box>
        </Grid>
        <Grid item xl={10} lg={10} md={9} sm={12} xs={12}>
          <Box
            px={smallScreen ? 1 : 2}
            pb={smallScreen ? 1 : 2}
            pt={20}
            position="relative"
          >
            <Toolbar className={classes.MainScreenNav}>
              <IconButton
                className={classes.MenuOpenButton}
                onClick={() => setSideNavOpen((cur) => !cur)}
              >
                <MenuOutlined />
              </IconButton>
              {!smallScreen ? (
                <IconButton onClick={goBack}>
                  <ChevronLeftOutlined />
                </IconButton>
              ) : null}

              {smallScreen ? (
                <div>
                  <Logo dark orientation="horizontal" />

                  {/* <Typography variant="h6">
                    {appRoute[0].toUpperCase() +
                      appRoute.slice(1, appRoute.length)}
                  </Typography> */}
                </div>
              ) : null}
            </Toolbar>
            {children}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Layout;
