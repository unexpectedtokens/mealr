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
      <Card>
        <Box p={2}>
          <CardContent>
            <Typography
              variant="h6"
              color="primary"
              style={{ fontWeight: "bold" }}
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
              onClick={() => navigate("/profile")}
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
