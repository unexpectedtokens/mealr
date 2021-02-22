import {
  Box,
  CircularProgress,
  Fade,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";
import config from "../../../../../Config/config";

function MealPlanner({ auth }) {
  const [plan, setPlan] = useState({});
  const [loading] = useState(false);

  const fetchMealPlan = useCallback(async () => {
    const response = await fetch(`${config.API_URL}/api/mealplan/generate/`, {
      method: "GET",
      headers: {
        Authorization: auth.authInfo.Key,
      },
    });
    const data = await response.json();
    console.log(data);
    setPlan(data);
  }, [auth.authInfo.Key]);
  useEffect(() => {
    fetchMealPlan();
  }, [fetchMealPlan]);
  return (
    <Fade in={true}>
      <Paper elevation={1}>
        <Box p={1}>
          <Grid container>
            {!loading ? (
              <Box>
                {Object.keys(plan).map((i) => {
                  const day = plan[i];
                  const Breakfast = day.Breakfast;
                  // const Lunch = day.Lunch;
                  // const dinner = day.Dinner;
                  return (
                    <Grid item>
                      <Paper>
                        {Object.keys(Breakfast).map((item) => {
                          console.log(item, Breakfast[item]);
                          return <Typography>{Breakfast.Label}</Typography>;
                        })}
                      </Paper>
                    </Grid>
                  );
                })}
              </Box>
            ) : (
              <CircularProgress size="1.5rem" />
            )}
          </Grid>
        </Box>
      </Paper>
    </Fade>
  );
}

export default MealPlanner;
