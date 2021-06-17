import { Box, Button, Paper, TextField } from "@material-ui/core";
import { useState } from "react";

const MethodStepAdder = ({ hide, addNewMethodStep }) => {
  const [newMethodStep, setNewMethodStep] = useState("");
  const handleHide = () => {
    setNewMethodStep("");
    hide();
  };
  const handleNewMethodStepAddition = () => {
    addNewMethodStep(newMethodStep);
    handleHide();
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
