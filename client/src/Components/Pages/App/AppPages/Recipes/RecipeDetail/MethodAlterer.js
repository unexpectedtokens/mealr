import {
  Paper,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { useQueryClient } from "react-query";
import config from "../../../../../../Config/config";
const MethodAlterer = ({
  curStep,
  hide,
  stepid,
  recipeid,
  handleAuthenticatedEndpointRequest,
}) => {
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState("");
  const [inclTimer, setInclTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [actionAfterTimer, setActionAfterTimer] = useState("");
  const handleHide = () => {
    setDescription("");
    setDuration(0);
    hide();
  };
  const { enqueueSnackbar } = useSnackbar();
  const client = useQueryClient();
  const handleMethodStepUpdate = async () => {
    console.log("yes");
    const body = {
      durationInMinutes: parseFloat(duration),
      stepDescription: description,
      inclTimer,
      actionAfterTimer,
      timerDuration: parseFloat(timerDuration),
    };
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/detail/${recipeid}/method/${stepid}`,
      "PATCH",
      JSON.stringify(body)
    );
    if (response.status === 200) {
      client.setQueryData("methodSteps", (old) =>
        old.map((x) => {
          if (x.ID === stepid) {
            x.StepDescription = description;
            x.DurationInMinutes = duration;
            if (inclTimer) {
              x.ActionAfterTimer = actionAfterTimer;
              x.TimerDuration = timerDuration;
            } else {
              x.TimerDuration = 0;
              x.ActionAfterTimer = "";
            }
          }
          return x;
        })
      );
      enqueueSnackbar("Succesfully updated methodstep", { variant: "success" });
    } else {
      enqueueSnackbar("Something went wrong updating. Please try again", {
        variant: "error",
      });
    }
    handleHide();
  };

  const handleDurationValChanged = (val) => {
    if (val < 0) {
      setDuration(0);
    }
    setDuration(val);
  };

  useEffect(() => {
    const { StepDescription, StepDuration, TimerDuration, ActionAfterTimer } =
      curStep;
    setDuration(StepDuration || StepDuration === 0 ? StepDuration : 0);
    setDescription(StepDescription ? StepDescription : "");
    const inclTimer = TimerDuration ? true : false;
    setInclTimer(inclTimer);
    if (inclTimer) {
      setActionAfterTimer(ActionAfterTimer);
      setTimerDuration(TimerDuration);
    }
  }, [curStep]);

  return (
    <Paper style={{ minWidth: "50%" }}>
      <Box p={2}>
        {curStep.StepDescription ? (
          <>
            <TextField
              multiline
              type="text"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              fullWidth
              variant="outlined"
              label="description"
            />
            <Box p={2}>
              <TextField
                type="number"
                onChange={(e) => handleDurationValChanged(e.target.value)}
                value={duration}
                fullWidth
                variant="outlined"
                label="Duration in minutes"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    size="medium"
                    checked={inclTimer}
                    onChange={() => setInclTimer((cur) => !cur)}
                    name="public"
                    color="primary"
                  />
                }
                label="Do you need a timer for this step?"
              />
            </Box>
            {inclTimer ? (
              <Box>
                <Box>
                  <TextField
                    variant="filled"
                    value={timerDuration}
                    type="number"
                    label="Timer duration"
                    onChange={(e) => setTimerDuration(e.target.value)}
                  />
                </Box>
                <Box>
                  <TextField
                    variant="filled"
                    value={actionAfterTimer}
                    type="text"
                    label="What should happen after the timer?"
                    fullWidth
                    onChange={(e) => setActionAfterTimer(e.target.value)}
                  />
                </Box>
              </Box>
            ) : null}
            <Box py={2} display="flex">
              <Box pr={1}>
                <Button onClick={handleHide} color="secondary">
                  Cancel
                </Button>
              </Box>
              <Button
                fullWidth
                variant="contained"
                disabled={
                  description.length <= 2 ||
                  (description === curStep.Description &&
                    duration === curStep.Duration)
                }
                color={
                  description.length <= 2 ||
                  (description === curStep.Description &&
                    duration === curStep.Duration)
                    ? "disabled"
                    : "primary"
                }
                style={{ fontWeight: 700 }}
                onClick={handleMethodStepUpdate}
              >
                Save Step
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Paper>
  );
};

export default MethodAlterer;
