import {
  Box,
  Button,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useQueryClient } from "react-query";
import config from "../../../../../../Config/config";

const useStyle = makeStyles((theme) => ({
  input: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: "5px",
    border: "none",
  },
}));

const MethodStepAdder = ({
  recipeid,
  hide,
  handleAuthenticatedEndpointRequest,
  buttonText,
  firstInputName,
}) => {
  const [newMethodStep, setNewMethodStep] = useState("");
  const [duration, setDuration] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyle();
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
      const data = await response.json();
      client.setQueryData("methodSteps", (old) => [...old, data]);
      enqueueSnackbar("Succesfully added a new step", { variant: "success" });
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
    <Paper style={{ minWidth: "60%" }}>
      <Box p={3}>
        <Box pb={2}>
          <Typography variant="h4">Add a new instruction</Typography>
        </Box>
        <TextField
          multiline
          type="text"
          onChange={(e) => setNewMethodStep(e.target.value)}
          value={newMethodStep}
          fullWidth
          variant="filled"
          label={firstInputName}
          InputProps={{
            className: classes.input,
          }}
          inputProps={{
            className: classes.input,
          }}
        />
        <Box mt={2}>
          <TextField
            type="number"
            onChange={(e) => handleDurationValChanged(e.target.value)}
            value={duration}
            fullWidth
            variant="filled"
            inputProps={{
              className: classes.input,
            }}
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
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MethodStepAdder;
