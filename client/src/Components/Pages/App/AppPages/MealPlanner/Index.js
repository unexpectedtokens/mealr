import {
  Box,
  CircularProgress,
  Grid,
  Grow,
  Paper,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import config from "../../../../../Config/config";

function MealPlanner() {
  const [plan, setPlan] = useState({});
  const [planLoaded, setPlanLoaded] = useState(false);
  const fetchMealPlan = async () => {
    const response = await fetch(`${config.API_URL}/api/generateplan/`, {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
    setPlan(data);
  };
  useEffect(() => {
    fetchMealPlan();
  }, []);
  useEffect(() => {
    setPlanLoaded(Object.keys(plan).length > 0);
  }, [plan, setPlanLoaded]);
  return (
    <Paper>
      <Box p={1}>
        <Grid container>
          {planLoaded ? (
            <Grow in={planLoaded}>
              <Box>
                {Object.keys(plan).map((i) => {
                  const day = plan[i];
                  const Breakfast = day.Breakfast;
                  const Lunch = day.Lunch;
                  const dinner = day.Dinner;
                  return (
                    <Grid item>
                      <Grow in={planLoaded}>
                        <Paper>
                          {Object.keys(Breakfast).map((item) => {
                            console.log(item, Breakfast[item]);
                            return <Typography>{Breakfast.Label}</Typography>;
                          })}
                        </Paper>
                      </Grow>
                    </Grid>
                  );
                })}
              </Box>
            </Grow>
          ) : (
            <CircularProgress size="1.5rem" />
          )}
        </Grid>
      </Box>
    </Paper>
  );
}

export default MealPlanner;
