import {
  Card,
  Box,
  Typography,
  Backdrop,
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Grid,
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
import MethodStepAdder from "./MethodAdder";
import MethodAlterer from "./MethodAlterer";

const Instruction = ({ Instruction, userIsOwner }) => {
  return (
    <Grid item sm={12} xs={12} md={6} lg={4}>
      <Card elevation={0}>
        <Box p={3} display="flex" flexDirection="column">
          <Box>
            <Box pb={2} display="flex" justifyContent="space-between">
              <Typography style={{ fontSize: 30, fontWeight: 700 }}>
                Step {Instruction.StepNumber}
              </Typography>
              {userIsOwner ? (
                <Box>
                  <IconButton>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton>
                    <ChevronRight />
                  </IconButton>
                  <IconButton>
                    <EditOutlined />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
            <Typography style={{ fontSize: 22, opacity: 0.6 }}>
              {/* {Instruction.StepDescription} */}
              Heat the oven to 300 degrees celsius
            </Typography>
          </Box>
          <Box pt={3} display="flex" justifyContent="flex-end">
            <Box mr={2} display="flex" justifyContent="flex-end">
              <Notifications />
            </Box>
            <Box display="flex" alignItems="center">
              <Box mr={1} display="flex" alignItems="center">
                <AccessTimeRounded />
              </Box>
              <Typography>30 minutes</Typography>
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [idToAlter, setIDToAlter] = useState(0);
  const [stepToAlter, setStepToAlter] = useState({});
  const client = useQueryClient();
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
      console.log("step", step);
      setShowMethodStepUpdater(true);
    } else {
      console.log(
        `something went wrong: no step selected. id: ${id}, data: ${data}`
      );
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
      methodSteps.sort(
        (a, b) => new Date(a.TimeStampAdded) - new Date(b.TimeStampAdded)
      );
      client.setQueryData("methodSteps", () => methodSteps);
    }
  }, [isError, isLoading, data, client, setTotalTime]);

  // useEffect(() => {
  //   setTotalTime(0);
  //   let totalMinutes = 0;
  //   data?.forEach((m) => (totalMinutes += parseFloat(m.DurationInMinutes)));
  //   setTotalTime(totalMinutes);
  // });
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
      {/*
      <Backdrop open={showMethodStepUpdater} style={{ zIndex: 1001 }}>
        <MethodAlterer
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
          stepid={stepToAlter.ID}
          curStepDuration={stepToAlter.DurationInMinutes}
          curStepDescription={stepToAlter.StepDescription}
          recipeid={recipeid}
          hide={() => setShowMethodStepUpdater(false)}
        />
      </Backdrop> */}

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
            <Box ml={2}>
              <Button color="primary" variant="contained" disableElevation>
                Start cooking <PlayArrow />
              </Button>
            </Box>
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
                <Grid container spacing={2}>
                  {data.map((item) => (
                    <Instruction userIsOwner={userIsOwner} Instruction={item} />
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
