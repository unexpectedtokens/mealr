import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grow,
  makeStyles,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import img_1 from "../../../assets/images/bulbfish400_x_300.jpeg";

const useStyles = makeStyles({
  FormContainer: {
    overflow: "hidden",
  },
  FormHeader: {
    backgroundImage: `linear-gradient(#47824abb, #47824a), url(${img_1})`,
    height: 150,
    backgroundPosition: "center",
    backgroundSize: "120%",
  },
  FormHeaderText: {
    color: "#fff",
    fontWeight: 700,
  },
  FormPaper: {
    margin: "0 auto",
    transform: "translateY(-5%)",
  },
  FormSubmit: {
    padding: "0.5rem",
    fontWeight: 700,
  },
});

const FormContainer = ({
  children,
  title,
  submit,
  cancel,
  cancelText,
  saveButtonText,
  loading,
}) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  return (
    <Grow in={true}>
      <Container maxWidth="md">
        <Paper className={classes.FormContainer} elevation={1}>
          <Box
            className={classes.FormHeader}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            pl={matches ? 1 : 2}
          >
            <Typography variant="h4" className={classes.FormHeaderText}>
              {title}
            </Typography>
          </Box>

          <Box pl={matches ? 1 : 2} pr={matches ? 1 : 2}>
            <Paper className={classes.FormPaper} elevation={1}>
              <Box p={matches ? 1 : 2}>
                <form>
                  {children}
                  <Box display="flex" justifyContent="stretch">
                    <Box pr={1}>
                      <Button
                        className={classes.FormSubmit}
                        onClick={cancel}
                        color="secondary"
                      >
                        {cancelText || "Cancel"}
                      </Button>
                    </Box>
                    <Button
                      fullWidth
                      color="primary"
                      className={classes.FormSubmit}
                      variant="contained"
                      onClick={submit}
                      disableElevation
                    >
                      {loading ? <CircularProgress /> : saveButtonText}
                    </Button>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </Grow>
  );
};

export default FormContainer;
