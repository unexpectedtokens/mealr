import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { AccessTimeRounded, Check, Stop } from "@material-ui/icons";
import { useState } from "react";
import styled from "styled-components";

const CookerContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  > div {
    max-width: 960px;
  }
`;

const Cooker = ({ steps, quitCooking }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const { length } = steps;
  const handleQuitCooking = () => {
    quitCooking();
    setStepIndex(0);
  };
  const currentStep = steps[stepIndex];

  return (
    <CookerContainer>
      <Box
        justifyContent="space-around"
        flexDirection="column"
        alignItems="center"
        display="flex"
        flexGrow={1}
      >
        {/* <Box>
          <IconButton
            size="medium"
            color="primary"
            disabled={!stepIndex}
            onClick={() => setStepIndex((cur) => cur + -1)}
          >
            <ChevronLeft />
          </IconButton>
        </Box> */}
        <Box display="flex" alignItems="center">
          <Button
            disabled={!stepIndex}
            onClick={() => setStepIndex((cur) => cur + -1)}
          >
            Previous step
          </Button>
          <Box mx={2}>
            <Button
              color="primary"
              variant="contained"
              disableElevation
              disabled={length <= 1 || stepIndex + 1 === length}
              onClick={() => setStepIndex((cur) => cur + 1)}
            >
              <Box alignItems="center" display="flex">
                <Box pr={1} alignItems="center" display="flex">
                  <Check />
                </Box>
                <Typography>Next Step</Typography>
              </Box>
            </Button>
          </Box>
          <IconButton onClick={handleQuitCooking} color="secondary">
            <Stop />
          </IconButton>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <h1>{currentStep.StepDescription}</h1>
          <Box display="flex">
            <Box pr={1}>
              <AccessTimeRounded />
            </Box>
            <Typography>{currentStep.DurationInMinutes} minutes</Typography>
          </Box>
        </Box>
        {/* <Box>
          <IconButton
            size="medium"
            color="primary"
            disabled={length <= 1 || stepIndex + 1 === length}
            onClick={() => setStepIndex((cur) => cur + 1)}
          >
            <ChevronRight />
          </IconButton>
        </Box> */}
      </Box>
    </CookerContainer>
  );
};

export default Cooker;
