import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grow,
  Paper,
  Fade,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

import config from "../../../../../Config/config";

//const useStyles = makeStyles({});

const ControlButton = ({ buttonText, onClick, color }) => {
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        disableElevation
        variant="contained"
        color={color}
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

const ControlButtons = ({ goBack, nextStep }) => {
  return (
    <Box display="flex" justifyContent="flex-end">
      {!goBack ? null : (
        <Box mr={2}>
          <ControlButton buttonText="Go back" color="secondary" />
        </Box>
      )}

      <ControlButton
        buttonText="Next step"
        color="primary"
        onClick={nextStep}
      />
    </Box>
  );
};

const FormContainer = ({ title, children }) => {
  return (
    <Box py={3}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Box>
  );
};

const Form1 = ({ submit }) => {
  const [vegan, setVegan] = useState(false);
  const [vegetarian, setVeggie] = useState(false);
  return (
    <FormContainer title="Are you looking for a vegan or vegetarian mealplan?">
      <Box pt={3} display="flex" flexDirection="column">
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={vegan}
                onChange={() => setVegan((cur) => !cur)}
                name="vegan"
                color="primary"
              />
            }
            label="Vegan"
          />
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={vegetarian}
                onChange={() => setVeggie((cur) => !cur)}
                name="vegetarian"
                color="primary"
              />
            }
            label="Vegetarian"
          />
        </FormControl>
        <ControlButtons goBack={null} nextStep={submit} />
      </Box>
    </FormContainer>
  );
};

const maxMinSteps = [1, 6];

function MealPlanner({ validForMG, navigate, setActiveRoute }) {
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [isNext, setIsNext] = useState(false);
  const [isPrev, setIsPrev] = useState(false);

  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    setActiveRoute("meal planner");
    //eslint-disable-next-line
  }, []);
  const generateSocket = useCallback(() => {
    const newWS = new WebSocket("ws://localhost:8080/ws_test");

    ws.current = newWS;
    ws.current.onopen = () => {
      setConnected(true);
      enqueueSnackbar("succesfully connected to mealplan generator");
    };
    ws.current.onmessage = messageHandler;
    ws.current.onclose = (e) => {
      console.log("closing connection:", e);
      setConnected(false);
    };
    ws.current.onerror = () => {
      enqueueSnackbar(
        "mealplan generator connection error, attempting to reconnect..."
      );
      setConnected(false);
      generateSocket();
    };
  }, [enqueueSnackbar]);

  useEffect(() => {
    generateSocket();
  }, [generateSocket]);

  const emit = (msg) => {
    ws.current.send(msg);
  };

  const messageHandler = (msg) => {
    console.log(msg);
  };

  const handleForm1Submit = (data) => {
    setStep(2);
  };
  const handleForm2Submit = (data) => {
    setStep(3);
  };
  const goBack = () => {
    setStep((cur) => cur--);
  };

  useEffect(() => {
    if (step > 1) {
      setIsPrev(true);
    } else {
      setIsPrev(false);
    }
    if (step < maxMinSteps[1]) {
      setIsNext(true);
    } else {
      setIsNext(false);
    }
  }, [step]);

  return (
    <>
      <Helmet>
        <title>Meal planner</title>
      </Helmet>
      <Grow in={connected}>
        <Box display="flex" justifyContent="center" alignItems="center">
          {/* <Typography>This feature is under active development</Typography> */}
          <Paper>
            <Box p={3}>
              <Box pb={4}>
                <Typography color="primary">
                  Step {step} of {maxMinSteps[1]}
                </Typography>
              </Box>
              <Box>
                <Fade direction="right" in={step === 1} unmountOnExit={true}>
                  <Box>
                    <Form1
                      submit={handleForm1Submit}
                      goBack={goBack}
                      unmountOnExit={true}
                    />
                  </Box>
                </Fade>
                <Fade direction="right" in={step === 2} unmountOnExit={true}>
                  <Box>
                    <Form1 submit={handleForm2Submit} goBack={goBack} />
                  </Box>
                </Fade>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* <Box display="flex" justifyContent="flex-start">
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
        </Box> */}
      </Grow>
    </>
  );
}

export default MealPlanner;
