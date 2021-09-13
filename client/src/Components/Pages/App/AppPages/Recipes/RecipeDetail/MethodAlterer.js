import { Paper, Box, TextField, Button } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { useQueryClient } from "react-query";
import config from "../../../../../../Config/config";
const MethodAlterer = ({
  curStepDescription,
  curStepDuration,
  hide,
  stepid,
  recipeid,
  handleAuthenticatedEndpointRequest,
}) => {
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState("");
  const handleHide = () => {
    setDescription("");
    setDuration(0);
    hide();
  };
  const { enqueueSnackbar } = useSnackbar();
  const client = useQueryClient();
  const handleMethodStepUpdate = async () => {
    console.log("yes");
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/detail/${recipeid}/method/${stepid}`,
      "PATCH",
      JSON.stringify({
        durationInMinutes: parseFloat(duration),
        stepDescription: description,
      })
    );
    if (response.status === 200) {
      client.setQueryData("methodSteps", (old) =>
        old.map((x) => {
          if (x.ID === stepid) {
            x.StepDescription = description;
            x.DurationInMinutes = duration;
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
    setDuration(curStepDuration ? curStepDuration : "");
    setDescription(curStepDescription ? curStepDescription : "");
  }, [curStepDescription, curStepDuration]);
  return (
    <Paper style={{ minWidth: "50%" }}>
      <Box p={2}>
        {curStepDescription && curStepDuration ? (
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
                  (description === curStepDescription &&
                    duration === curStepDuration)
                }
                color={
                  description.length <= 2 ||
                  (description === curStepDescription &&
                    duration === curStepDuration)
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
