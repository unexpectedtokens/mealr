import {
  Card,
  Box,
  Typography,
  Backdrop,
  Button,
  useTheme,
  IconButton,
  Grid,
  useMediaQuery,
  Divider,
} from "@material-ui/core";
import {
  AccessTimeRounded,
  AddOutlined,
  ChevronLeft,
  ChevronRight,
  DeleteOutlined,
  PlayArrow,
  EditOutlined,
  Notifications,
} from "@material-ui/icons";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import config from "../../../../../../Config/config";
import Confirm from "../../../../../Reusables/App/Confirm";
import Cooker from "./Cooker";
import MethodStepAdder from "./MethodAdder";
import MethodAlterer from "./MethodAlterer";

const Instruction = ({
  Instruction,
  userIsOwner,
  edit,
  length,
  index,
  handleChangeOrderButtonClicked,
}) => {
  return (
    <Grid item sm={12} xs={12} md={6} lg={4}>
      <Card elevation={0} style={{ height: "100%" }}>
        <Box
          p={3}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box>
            <Box pb={2} display="flex" justifyContent="space-between">
              <Typography style={{ fontSize: 25, fontWeight: 700 }}>
                Step {Instruction.StepNumber}
              </Typography>
              {userIsOwner ? (
                <Box>
                  <IconButton
                    disabled={!index}
                    onClick={() =>
                      handleChangeOrderButtonClicked(index, index - 1)
                    }
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    disabled={length > 1 && index + 1 === length}
                    onClick={() =>
                      handleChangeOrderButtonClicked(index, index + 1)
                    }
                  >
                    <ChevronRight />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      edit(Instruction.ID);
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
            <Typography style={{ fontSize: 22, opacity: 0.6 }}>
              {Instruction.StepDescription}
            </Typography>
          </Box>
          <Box pt={3} display="flex" justifyContent="flex-end">
            {Instruction.TimerDuration ? (
              <Box mr={2} display="flex" justifyContent="flex-end">
                <Notifications />
              </Box>
            ) : null}

            <Box display="flex" alignItems="center">
              <Box mr={1} display="flex" alignItems="center">
                <AccessTimeRounded />
              </Box>
              <Typography>{Instruction.DurationInMinutes} minutes</Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

const Methods = ({
  recipeid,
  userIsOwner,
  handleAuthenticatedEndpointRequest,
  setTotalTime,
}) => {
  const [showMethodStepAdder, setShowMethodStepAdder] = useState(false);
  const [showMethodStepUpdater, setShowMethodStepUpdater] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idToAlter, setIDToAlter] = useState(0);
  const [stepToAlter, setStepToAlter] = useState({});
  const theme = useTheme();
  const client = useQueryClient();
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const fetchMethodSteps = async () => {
    const response = await fetch(
      `${config.API_URL}/api/recipes/detail/${recipeid}/method/`
    );
    return response.json();
  };

  const { data, isError, isLoading, refetch } = useQuery(
    "methodSteps",
    fetchMethodSteps
  );
  const handleDeleteButtonClicked = (id) => {
    setIDToAlter(id);
    setShowConfirm(true);
  };

  const handleUpdateButtonClicked = (id) => {
    const step = data.filter((x) => x.ID === id)[0];
    if (step) {
      setStepToAlter(step);
      setIDToAlter(id);

      setShowMethodStepUpdater(true);
    } else {
      console.log(
        `something went wrong: no step selected. id: ${id}, data: ${data}`
      );
    }
  };

  const handleOrderChangeButtonClicked = async (indexOne, indexTwo) => {
    const steps = [...data];
    const stepOne = { ...steps[indexOne] };
    const stepTwo = { ...steps[indexTwo] };
    const stepOneNumber = stepOne.StepNumber;
    const stepTwoNumber = stepTwo.StepNumber;

    const newSteps = steps.map((x, index) => {
      if (index === indexOne) {
        console.log("replacing first one");
        return { ...x, StepNumber: stepTwoNumber };
      } else if (index === indexTwo) {
        console.log("replacing second one");
        return { ...x, StepNumber: stepOneNumber };
      } else {
        return x;
      }
    });
    const body = {
      step1: {
        stepID: stepOne.ID,
        changingTo: stepTwo.StepNumber,
      },
      step2: {
        stepID: stepTwo.ID,
        changingTo: stepOne.StepNumber,
      },
    };
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/detail/${recipeid}/switchsteps/`,
      "PATCH",
      JSON.stringify(body)
    );
    console.log(response.status);
    if (response.status === 200) {
      client.setQueryData("methodSteps", () => newSteps);
    } else {
      client.setQueryData("methodSteps", () => steps);
    }
  };

  const deleteItem = async () => {
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/detail/${recipeid}/method/${idToAlter}`,
      "DELETE"
    );
    if (response.status === 200) {
      client.setQueryData("methodSteps", (old) =>
        old.filter((x) => x.ID !== idToAlter)
      );
    }
    setShowConfirm(false);
  };
  useEffect(() => {
    if (!isError && !isLoading) {
      const methodSteps = [...data];
      methodSteps.sort((a, b) => a.StepNumber - b.StepNumber);
      client.setQueryData("methodSteps", () => methodSteps);
    }
  }, [isError, isLoading, data, client, setTotalTime]);

  // useEffect(() => {
  //   setTotalTime(0);
  //   let totalMinutes = 0;
  //   data?.forEach((m) => (totalMinutes += parseFloat(m.DurationInMinutes)));
  //   setTotalTime(totalMinutes);
  // });
  const length = !isError && !isLoading && data.length ? data.length : 0;
  console.log(data);
  return (
    <>
      <Backdrop open={showMethodStepAdder} style={{ zIndex: 1001 }}>
        <MethodStepAdder
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
          buttonText="add instruction"
          firstInputName="New Instruction"
          recipeid={recipeid}
          hide={() => setShowMethodStepAdder(false)}
        />
      </Backdrop>

      <Backdrop open={showMethodStepUpdater} style={{ zIndex: 1001 }}>
        <MethodAlterer
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
          stepid={stepToAlter.ID}
          curStep={stepToAlter}
          curStepDuration={stepToAlter.DurationInMinutes}
          curStepDescription={stepToAlter.StepDescription}
          recipeid={recipeid}
          hide={() => setShowMethodStepUpdater(false)}
        />
      </Backdrop>

      {/* <Confirm
        hide={() => setShowConfirm(false)}
        itemName="step"
        showConfirm={showConfirm}
        confirm={deleteItem}
      /> */}

      <Box py={3}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h5" style={{ fontWeight: 700 }}>
            Instructions
          </Typography>
          <Box display="flex">
            {userIsOwner ? (
              <Button
                color="primary"
                variant="text"
                onClick={() => setShowMethodStepAdder(true)}
              >
                <AddOutlined /> instruction
              </Button>
            ) : null}
            {!isError && !isLoading && data.length > 0 ? (
              <>
                <Backdrop open={cooking} style={{ zIndex: 1001 }}>
                  <Cooker steps={data} quitCooking={() => setCooking(false)} />
                </Backdrop>

                <Box ml={2}>
                  {smallScreen ? (
                    <IconButton
                      color="primary"
                      onClick={() => setCooking(true)}
                    >
                      <PlayArrow />
                    </IconButton>
                  ) : (
                    <Button
                      color="primary"
                      variant="contained"
                      disableElevation
                      onClick={() => setCooking(true)}
                    >
                      Start Cookin' <PlayArrow />
                    </Button>
                  )}
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
        <Box pt={2}>
          {isError && !isLoading ? (
            <>
              <Typography>
                Something went wrong fetching the steps for this recipe
              </Typography>
              <Button onClick={refetch}>Try Again</Button>
            </>
          ) : null}
          {!isError && !isLoading ? (
            <Box>
              {data.length > 0 ? (
                <Grid container spacing={2} alignItems="stretch">
                  {data.map((item, index) => (
                    <Instruction
                      key={item.StepNumber}
                      userIsOwner={userIsOwner}
                      Instruction={item}
                      edit={handleUpdateButtonClicked}
                      length={length}
                      index={index}
                      handleChangeOrderButtonClicked={
                        handleOrderChangeButtonClicked
                      }
                      // setUpdateID={setIDToAlter}
                      // setStepToAlter={setStepToAlter}
                    />
                  ))}
                </Grid>
              ) : (
                <Typography>There are no method steps yet</Typography>
              )}
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default Methods;
