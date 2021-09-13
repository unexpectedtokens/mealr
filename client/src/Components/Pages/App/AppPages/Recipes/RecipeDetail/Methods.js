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
} from "@material-ui/core";
import {
  AccessTimeRounded,
  DeleteOutlined,
  EditOutlined,
} from "@material-ui/icons";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import config from "../../../../../../Config/config";
import Confirm from "../../../../../Reusables/App/Confirm";
import MethodStepAdder from "./MethodAdder";
import MethodAlterer from "./MethodAlterer";

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

  useEffect(() => {
    setTotalTime(0);
    let totalMinutes = 0;
    data?.forEach((m) => (totalMinutes += parseFloat(m.DurationInMinutes)));
    setTotalTime(totalMinutes);
  });
  return (
    <>
      <Backdrop open={showMethodStepAdder} style={{ zIndex: 1001 }}>
        <MethodStepAdder
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
          buttonText="add method step"
          firstInputName="new step"
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
          curStepDuration={stepToAlter.DurationInMinutes}
          curStepDescription={stepToAlter.StepDescription}
          recipeid={recipeid}
          hide={() => setShowMethodStepUpdater(false)}
        />
      </Backdrop>

      <Confirm
        hide={() => setShowConfirm(false)}
        itemName="step"
        showConfirm={showConfirm}
        confirm={deleteItem}
      />
      <Card>
        <Box p={2}>
          <Typography variant="h6">Method</Typography>
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
                  <List>
                    {data.map((x, i) => (
                      <ListItem key={x.ID}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                        >
                          <Box pb={1} style={{ maxWidth: "85%" }}>
                            <Typography>
                              <Typography
                                component="span"
                                style={{ fontWeight: 900 }}
                              >
                                Step {i + 1}:
                              </Typography>{" "}
                              {x.StepDescription}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <Box pr={1} display="flex" alignItems="center">
                              <AccessTimeRounded />
                            </Box>
                            {x.DurationInMinutes} minutes
                          </Box>
                          {userIsOwner ? (
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() => handleUpdateButtonClicked(x.ID)}
                              >
                                <EditOutlined />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteButtonClicked(x.ID)}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </ListItemSecondaryAction>
                          ) : null}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>There are no method steps yet</Typography>
                )}
              </Box>
            ) : null}

            {userIsOwner ? (
              <Box py={1} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setShowMethodStepAdder(true);
                  }}
                >
                  Add Method Step
                </Button>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default Methods;
