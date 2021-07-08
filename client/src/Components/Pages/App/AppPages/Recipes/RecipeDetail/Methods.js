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
import { AccessTimeRounded, DeleteOutlined } from "@material-ui/icons";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import config from "../../../../../../Config/config";
import Confirm from "../../../../../Reusables/App/Confirm";
import MethodStepAdder from "./MethodAdder";

const Methods = ({
  recipeid,
  userIsOwner,
  handleAuthenticatedEndpointRequest,
  setTotalTime,
}) => {
  const [showMethodStepAdder, setShowMethodStepAdder] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idToDelete, setIDToDelete] = useState(0);
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
    setIDToDelete(id);
    setShowConfirm(true);
  };
  const deleteItem = async () => {
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/detail/${recipeid}/method/${idToDelete}`,
      "DELETE"
    );
    if (response.status === 200) {
      client.setQueryData("methodSteps", (old) =>
        old.filter((x) => x.ID !== idToDelete)
      );
    }

    //console.log(response);
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
    let totalMinutes = 0;
    if (!isError && !isLoading) {
      data.forEach((m) => (totalMinutes += m.DurationInMinutes));
    }
    setTotalTime(totalMinutes);
  }, [isError, isLoading, data, setTotalTime]);
  return (
    <>
      <Backdrop open={showMethodStepAdder} style={{ zIndex: 1001 }}>
        <MethodStepAdder
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
          recipeid={recipeid}
          hide={() => setShowMethodStepAdder(false)}
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
                    console.log("yuaas");
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
