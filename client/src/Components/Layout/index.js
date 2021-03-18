import { CssBaseline, ThemeProvider } from "@material-ui/core";
import theme from "./Theme";

function Layout(props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>{props.children}</div>
    </ThemeProvider>
  );
}

export default Layout;
