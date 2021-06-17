import {
  Box,
  ButtonBase,
  Grid,
  Grow,
  makeStyles,
  Typography,
} from "@material-ui/core";

import img1 from "../../../../../assets/images/bulbfish400_x_300.jpeg";
import img2 from "../../../../../assets/images/ella-olsson400_x_300.jpeg";
import img3 from "../../../../../assets/images/jill-wellington400_x_300.jpeg";
import img4 from "../../../../../assets/images/lisa-fotios400_x_300.jpeg";

const useStyles = makeStyles((theme) => ({
  BaseButton: {
    maxHeight: 150,
    width: "100%",
    height: "100%",
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
    position: "relative",
    boxShadow: theme.shadows[3],
    transition: `transform 300ms`,
    "& span": {
      zIndex: 3,
    },
    "&:hover": {
      transform: "scale(1.03)",
    },
    //background: `linear-gradient(to bottom right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
  },

  Container: {
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(4),
    },
  },
  CardAction: {
    background: `linear-gradient(to right, ${theme.palette.primary.main} 20%, rgba(0,0,0,0))`,
    //backgroundColor: theme.palette.primary.main,
    height: "100%",
    width: "100%",
    //clipPath: "polygon(0 0, 60% 0, 50% 100%, 0 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    position: "absolute",
    zIndex: 1,
  },
  CardTopHeader: {
    color: theme.palette.primary.contrastText,
    maxWidth: "50%",
    textAlign: "left",
    fontWeight: 300,
  },
  CardLabel: {
    color: theme.palette.primary.contrastText,
    marginBottom: "1rem",
    maxWidth: "50%",
    textAlign: "left",
    fontWeight: 400,
  },
  CardButton: {
    backgroundColor: theme.palette.primary.contrastText,
  },
  CardImage: {
    width: "100%",
    height: "100%",
    transform: "translateX(15%)",
    zIndex: 0,
  },
}));

const RecipeLanding = (props) => {
  const classes = useStyles();
  return (
    <Grid container className={classes.Container} spacing={2}>
      {[
        { label: "All recipes", url: "/all", img: img1, action: "See" },
        { label: "My recipes", url: "/my", img: img2, action: "See" },
        {
          label: "My favourite recipes",
          url: "/fav",
          img: img3,
          action: "See",
        },
        { label: "New recipe", url: "/create", img: img4, action: "Create" },
      ].map((link) => {
        return (
          <RecipeLinkOption
            key={link.url}
            img={link.img}
            url={link.url}
            action={link.action}
            label={link.label}
            classes={classes}
            navigate={props.navigate}
            path={"/recipes"}
          />
        );
      })}
    </Grid>
  );
};

const RecipeLinkOption = ({
  img,
  classes,
  url,
  action,
  label,
  navigate,
  path,
}) => {
  return (
    <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={url}>
      <Grow in={true}>
        <Box>
          <ButtonBase
            onClick={() => navigate(path + url)}
            className={classes.BaseButton}
            //style={{ transform: "scale(1)" }}
          >
            <Box className={classes.CardAction} p={2}>
              <Typography className={classes.CardTopHeader}>
                {action}
              </Typography>
              <Typography className={classes.CardLabel} variant="h5">
                {label}
              </Typography>
            </Box>

            <img className={classes.CardImage} src={img} alt="card-recipe" />
          </ButtonBase>
        </Box>
      </Grow>
    </Grid>
  );
};

export default RecipeLanding;
