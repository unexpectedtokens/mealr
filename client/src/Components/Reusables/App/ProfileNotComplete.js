import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grow,
  Typography,
} from "@material-ui/core";

function PNC({ navigate, show }) {
  return (
    <Grow in={show}>
      <Card elevation={0}>
        <Box p={2}>
          <CardContent style={{ padding: 8 }}>
            <Typography
              variant="h5"
              color="primary"
              style={{ fontWeight: 500 }}
            >
              Your profile is not complete.
            </Typography>
            <Typography>
              You need to complete it before you can generate a personal
              mealplan
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              style={{ fontWeight: "bold" }}
              onClick={() => navigate("/profile/edit")}
            >
              Complete Profile
            </Button>
          </CardActions>
        </Box>
      </Card>
    </Grow>
  );
}

export default PNC;
