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

const useStyles = makeStyles({
  ToolBar: {
    justifyContent: "space-between",
  },
  NavLink: {
    color: "inherit",
    padding: 2,
    margin: "0 0.5rem",
    fontWeight: 700,
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
});

function Index(props) {
  let history = useHistory();
  const classes = useStyles();
  return (
    <>
      <AppBar color="transparent" elevation={0} position="relative">
        <Container maxWidth="lg">
          <Toolbar className={classes.ToolBar}>
            <Logo />

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
