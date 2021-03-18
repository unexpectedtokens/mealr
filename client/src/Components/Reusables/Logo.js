import { Box, makeStyles, Typography } from "@material-ui/core";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  Logo: {
    fontSize: "2rem",
    fontWeight: "bolder",
    borderBottom: theme.palette.primary.main,
    cursor: "pointer",
  },
  Span: {
    color: theme.palette.primary.main,
  },
}));

function Logo() {
  const classes = useStyles();
  const history = useHistory();
  return (
    <Box>
      <Typography className={classes.Logo} onClick={() => history.push("/")}>
        <span className={classes.Span}>Lem</span>Bas
      </Typography>
    </Box>
  );
}

export default Logo;
