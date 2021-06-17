import {
  AppBar,
  Box,
  Container,
  Link,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import { useHistory, Link as RouterLink } from "react-router-dom";
import Logo from "../Reusables/Logo";
import LandingHeader from "./LandingHeader";

const useStyles = makeStyles((theme) => ({
  ToolBar: {
    justifyContent: "space-between",
    padding: "2rem 0 0 0",
    borderBottom: "#eee 1px solid",
  },
  NavLink: {
    color: "inherit",
    padding: 2,
    margin: "0 0.5rem",
    fontWeight: 700,
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  slantedDiv: {
    width: "100%",
    height: "60%",
    position: "absolute",
    bottom: 0,
    left: 0,
    //background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main} 150%) `,
    backgroundColor: theme.palette.primary.main,
    clipPath: "polygon(0 80%, 50% 60%, 80% 10%, 100% 0, 100% 100%, 0 100%)",
    zIndex: -1,
  },
}));

function Index(props) {
  let history = useHistory();
  const classes = useStyles();
  return (
    <>
      <AppBar color="transparent" elevation={0} position="relative">
        <Container maxWidth="lg">
          <Toolbar className={classes.ToolBar}>
            <Logo dark orientation="horizontal" />

            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <Link
                className={classes.NavLink}
                to="/auth/"
                component={RouterLink}
              >
                Log In
              </Link>
              <Link
                className={classes.NavLink}
                to="/auth/create/"
                component={RouterLink}
              >
                Create an Account
              </Link>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg">
        <LandingHeader navigate={() => history.push("/auth/")} />
      </Container>
    </>
  );
}

export default Index;
