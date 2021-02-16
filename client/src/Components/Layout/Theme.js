import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#66bb6a",
      dark: "#47824a",
      light: "#e8f5e9",
      contrastText: "#fefefe",
    },
    grey: {
      main: "#212121",
    },
    secondary: { main: "#fefefe" },
  },
});

export default theme;
