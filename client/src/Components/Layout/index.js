import { CssBaseline, makeStyles, ThemeProvider } from "@material-ui/core";
import theme from "./Theme";
const styles = makeStyles((theme) => ({
  paper: {},
}));

function Layout(props) {
  const classes = styles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.paper}>{props.children}</div>
    </ThemeProvider>
  );
}

export default Layout;
