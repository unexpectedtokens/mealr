import {
  Card,
  Button,
  Box,
  Backdrop,
  Typography,
  IconButton,
  Divider,
} from "@material-ui/core";
import { DeleteOutlined, AddOutlined } from "@material-ui/icons";
import config from "../../../../../../Config/config";
import { useState } from "react";
import IngAdder from "./IngAdder";
import { useQuery, useQueryClient } from "react-query";
import styled from "styled-components";

const IngredientList = styled.ul`
  width: 100%;
  padding: 0;
  > li {
    margin-bottom: 12px;
    background-color: #fff;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 20px;
    border-radius: 5px;
    box-sizing: border-box;
    min-height: 60px;
    svg {
      fill: #212121;
    }
  }
`;
//box-shadow: 0 0 10px #55555511;
const Ingredients = ({
  recipeid,
  userIsOwner,
  handleAuthenticatedEndpointRequest,
  setTotalCalories,
  setUseablePercentage,
  setTotalWeight,
}) => {
  const client = useQueryClient();
  const [showIngAdder, setShowIngAdder] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    miscOrFi: "",
    id: 0,
  });
  const fetchMiscIngredients = async () => {
    const response = await fetch(
      `${config.API_URL}/api/recipes/detail/${recipeid}/mi/`
    );
    return response.json();
  };

  const deleteMiscIng = async (id) => {
    try {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/recipes/detail/${recipeid}/deletemi/${id}`,
        "DELETE"
      );
      if (response.status === 200) {
        client.setQueryData("miscIngredients", (old) =>
          old.filter((mi) => mi.ID !== id)
        );
      } else {
        console.log("nono");
      }
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteItem = () => {
    console.log(
      client.getQueryData("foodIngredients"),
      client.getQueryData("miscIngredients"),
      deleteOptions.id
    );
    // if (deleteOptions.miscOrFi === "fi") {
    //   deleteFoodIng(deleteOptions.id);
    // } else if (deleteOptions.miscOrFi === "mi") {
    deleteMiscIng(deleteOptions.id);
    //}
    setShowConfirm(false);
  };
  const miQuery = useQuery("miscIngredients", fetchMiscIngredients);
  // const fiQuery = useQuery("foodIngredients", fetchFoodIngredients);
  const error = miQuery.isError;
  const loading = miQuery.isLoading;
  const refetch = () => {
    miQuery.refetch();
    // fiQuery.refetch();
  };

  // useEffect(() => {
  //   if (!error && !loading) {

  //     const mi = miQuery.data;
  //     const totalLength = mi.length + fi.length;
  //     const calculatablePercentace = (fi.length / totalLength) * 100;
  //     let totalCalories = 0;
  //     let totalWeight = 0;
  //     fi.forEach((x) => {
  //       totalCalories += (x.Amount / 100) * x.CalsPer100;
  //       //if (x.ServingUnit === "g") {
  //       totalWeight += x.Amount;
  //       //}
  //     });
  //     setTotalCalories(totalCalories);
  //     setUseablePercentage(calculatablePercentace);
  //     setTotalWeight(totalWeight);
  //   }
  // }, [
  //   error,
  //   loading,
  //   fiQuery.data,
  //   miQuery.data,
  //   setTotalCalories,
  //   setUseablePercentage,
  //   setTotalWeight,
  // ]);
  return (
    <Box mt={6}>
      <Backdrop open={showIngAdder} style={{ zIndex: 1001 }}>
        <IngAdder
          hide={() => setShowIngAdder(false)}
          recipeid={recipeid}
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
        />
      </Backdrop>
      <Backdrop open={showConfirm} style={{ zIndex: 1001 }}>
        <Card>
          <Box p={2}>
            <Typography>
              Are you sure you want to delete this ingredient?
            </Typography>
            <Box pt={2} display="flex" justifyContent="flex-end">
              <Button onClick={() => setShowConfirm(false)} color="secondary">
                Cancel
              </Button>
              <Button color="primary" onClick={deleteItem}>
                Confirm
              </Button>
            </Box>
          </Box>
        </Card>
      </Backdrop>

      <Box>
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" style={{ fontWeight: 700 }}>
              Ingredients
            </Typography>
            {userIsOwner ? (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  color="primary"
                  variant="text"
                  onClick={() => setShowIngAdder(true)}
                >
                  <AddOutlined /> Add ingredient
                </Button>
              </Box>
            ) : null}
          </Box>

          {!loading && error ? (
            <>
              <Typography>Something went wrong fetching ingredients</Typography>
              <Button onClick={refetch}>Try again</Button>
            </>
          ) : null}
        </Box>

        {!loading && !error && miQuery.data.length > 0 ? (
          <IngredientList>
            {miQuery.data.map((i) => (
              <li key={i.ID}>
                <Typography
                  style={{ textTransform: "capitalize", fontWeight: 500 }}
                >
                  {i.Title}
                </Typography>

                <Box display="flex" alignItems="center">
                  <Box pr={3}>
                    <Typography>
                      {i.Amount} {i.Measurement}
                    </Typography>
                  </Box>

                  {userIsOwner ? (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        setDeleteOptions({ miscOrFi: "mi", id: i.ID });
                        setShowConfirm(true);
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  ) : null}
                </Box>
              </li>
            ))}
            {/* {fiQuery.data.map((i) => (
                <ListItem key={i.ID}>
                  <Typography>
                    <Typography component="span" style={{ fontWeight: 900 }}>
                      {i.Amount}
                      {i.ServingUnit}
                    </Typography>{" "}
                    of {i.Name}
                  </Typography>
                  {userIsOwner ? (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setDeleteOptions({ miscOrFi: "fi", id: i.ID });
                          setShowConfirm(true);
                        }}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  ) : null}
                </ListItem>
              ))} */}
          </IngredientList>
        ) : (
          <Typography>There are no ingredients in this recipe yet</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Ingredients;
