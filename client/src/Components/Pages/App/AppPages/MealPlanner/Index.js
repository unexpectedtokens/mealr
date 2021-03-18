import {
  Box,
  Button,
  Fade,
  //makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useEffect } from "react";
import config from "../../../../../Config/config";

//const useStyles = makeStyles({});

function MealPlanner({ auth }) {
  // const [plan, setPlan] = useState({});
  // const [loading, setLoading] = useState(false);
  // const [configure, setConfigure] = useState(true);

  const fetchMealPlan = async () => {
    const response = await fetch(`${config.API_URL}/api/mealplan/generate/`, {
      method: "GET",
      headers: {
        Authorization: auth.authInfo.Key,
      },
    });
    console.log(response.status);
    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    fetchMealPlan();
    //eslint-disable-next-line
  }, []);
  return (
    <Fade in={true}>
      <Box display="flex" justifyContent="flex-start">
        <Paper elevation={1}>
          <Box p={2}>
            <Typography variant="h6">Mealplan options</Typography>
            <Box p={2} pl={0}>
              <TextField
                type="number"
                id="aom"
                name="aom"
                label="Amount of meals a day"
              />
            </Box>

            <Button variant="contained" color="primary">
              Generate mealplan
            </Button>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}

export default MealPlanner;
