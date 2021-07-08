import { Box, Button, Paper, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useQueryClient } from "react-query";
import config from "../../../../../../Config/config";

const MethodStepAdder = ({
  recipeid,
  hide,
  handleAuthenticatedEndpointRequest,
}) => {
  const [newMethodStep, setNewMethodStep] = useState("");
  const [duration, setDuration] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const handleHide = () => {
    setNewMethodStep("");
    setDuration(0);
    hide();
  };
  const client = useQueryClient();
  const handleNewMethodStepAddition = async () => {
    try {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/recipes/detail/${recipeid}/method`,
        "POST",
        JSON.stringify({
          DurationInMinutes: parseFloat(duration),
          StepDescription: newMethodStep,
        })
      );
      console.log(response);
      const data = await response.json();
      client.setQueryData("methodSteps", (old) => [...old, data]);
      console.log(data);
    } catch (e) {
      console.log(e);
    }
    handleHide();
  };
  const handleDurationValChanged = (val) => {
    if (val < 0) {
      setDuration(0);
    }
    setDuration(val);
  };
  return (
    <Paper style={{ minWidth: "50%" }}>
      <Box p={2}>
        <TextField
          multiline
          type="text"
          onChange={(e) => setNewMethodStep(e.target.value)}
          value={newMethodStep}
          fullWidth
          variant="outlined"
          label="New step"
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
        <Box py={2} display="flex">
          <Box pr={1}>
            <Button onClick={handleHide} color="secondary">
              Cancel
            </Button>
          </Box>
          <Button
            fullWidth
            variant="contained"
            disabled={newMethodStep.length <= 2}
            color={newMethodStep.length <= 2 ? "disabled" : "primary"}
            style={{ fontWeight: 700 }}
            onClick={handleNewMethodStepAddition}
          >
            Add method step
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MethodStepAdder;
