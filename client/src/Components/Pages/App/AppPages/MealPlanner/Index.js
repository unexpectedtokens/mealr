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
import PNC from "../../../../Reusables/App/ProfileNotComplete";

//const useStyles = makeStyles({});

function MealPlanner({ auth, validForMG, navigate }) {
  // const [plan, setPlan] = useState({});
  // const [loading, setLoading] = useState(false);
  // const [configure, setConfigure] = useState(true);

  const fetchMealPlan = async () => {
    const response = await fetch(`${config.API_URL}/api/mealplan/generate/5`, {
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
    //fetchMealPlan();
    //eslint-disable-next-line
  }, []);
  return (
    <Fade in={true}>
      <Box display="flex" justifyContent="flex-start">
        {!validForMG ? (
          <PNC navigate={navigate} show={!validForMG} />
        ) : (
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

              <Button
                variant="contained"
                color="primary"
                onClick={fetchMealPlan}
              >
                Generate mealplan
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Fade>
  );
}

export default MealPlanner;
