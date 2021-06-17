import { Box, makeStyles, Typography } from "@material-ui/core";
import { useHistory } from "react-router";
import logoLight from "../../assets/images/logo-sa.svg";

const common = {
  fontSize: "2rem",
  fontWeight: 300,
  cursor: "pointer",
};

const useStyles = makeStyles((theme) => ({
  Logo: {
    ...common,
    color: theme.palette.primary.contrastText,
  },
  Span: {
    color: theme.palette.primary.dark,
  },
  SpanDark: {
    color: theme.palette.primary.dark,
  },
  Logodark: {
    ...common,
    color: theme.palette.text.primary,
  },
}));

function Logo({ dark, orientation }) {
  const classes = useStyles();
  const history = useHistory();
  return (
    <Box
      display="flex"
      onClick={() => history.push("/")}
      flexDirection={orientation === "horizontal" ? "row" : "column"}
      alignItems="center"
    >
      <img src={logoLight} alt="" width={30} />
      <Box pl={orientation === "horizontal" ? 1 : 0}>
        <Typography className={dark ? classes.Logodark : classes.Logo}>
          <span className={dark ? classes.SpanDark : classes.Span}>Lem</span>
          Bas
        </Typography>
      </Box>
    </Box>
  );
}

export default Logo;
