import {
  Backdrop,
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router";
import config from "../../../../../Config/config";
import FormContainer from "../../../../Reusables/App/FormContainer";
import IngAdder from "./IngAdder";
import MethodStepAdder from "./MethodAdder";
const AddRecipe = ({
  auth,
  refresh,
  navigate,
  handleAuthenticatedEndpointRequest,
}) => {
  const [miscIngs, setMiscIngs] = useState([]);
  const [methodSteps, setMethodSteps] = useState([]);
  const [foodIngIngs, setFoodIngIngs] = useState([]);
  const [showIngAdder, setShowIngAdder] = useState(false);
  const [showMethodStepAdder, setShowMethodStepAdder] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const Form = useFormik({
    initialValues: {
      title: "",
      file: "",
      vegan: false,
      vegetarian: false,
      preptime: "",
      cookingtime: "",
      description: "",
      typeOfRecipe: "Breakfast",
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const submitData = {
          Title: values.title,
          // IngredientsFromFoodIngredients: foodIngIngs.map((foodIng) => ({
          //   Amount: foodIng.amount,
          //   FoodIngredientID: foodIng.FoodIngredientID,
          // })),
          // IngredientsMisc: [...miscIngs],
          // Method: [...methodSteps],
          TypeOfMeal: values.typeOfRecipe,
          Description: values.description,
          // PrepTime: values.preptime,
          // CookingTime: values.cookingtime,
        };
        console.log(submitData);
        // const response = await handleAuthenticatedEndpointRequest(
        //   `${config.API_URL}/api/recipes/create/`,
        //   {
        //     method: "POST",
        //     headers: { Authorization: auth.Key },
        //     body: JSON.stringify(submitData),
        //   }
        // );
        const response = await handleAuthenticatedEndpointRequest(
          `${config.API_URL}/api/recipes/create/`,
          "POST",
          JSON.stringify(submitData)
        );
        if (response.status === 201) {
          enqueueSnackbar("Recipe was succesfully saved", {
            variant: "success",
          });
          console.log(response);
          const data = await response.json();
          console.log("data:", data);
          navigate(`/recipes/detail/${data.ID}`);
        }
      } catch (e) {
        enqueueSnackbar(
          "Something went wrong saving your recipe. Please try again",
          { variant: "error" }
        );
        console.log(e);
      }
    },
  });
  const addNewFoodIngredient = (ing) => {
    const newFoodIngIngs = [...foodIngIngs];
    newFoodIngIngs.push(ing);
    setFoodIngIngs(newFoodIngIngs);
  };
  const addNewMiscIngredient = (ing) => {
    const newMiscIngs = [...miscIngs];
    newMiscIngs.push(ing);
    setMiscIngs(newMiscIngs);
  };
  const handleFoodIngIngDelete = (index) => {
    const newFoodIngIngs = [...foodIngIngs].filter((ing, curIndex) => {
      return index !== curIndex;
    });
    setFoodIngIngs(newFoodIngIngs);
  };
  const handleMiscIngDelete = (index) => {
    const newMiscIngs = [...miscIngs].filter((ing, curIndex) => {
      return index !== curIndex;
    });
    setMiscIngs(newMiscIngs);
  };
  const addNewMethodStep = (step) => {
    const newMethod = [...methodSteps];
    newMethod.push(step);
    setMethodSteps(newMethod);
  };
  const handleMethodStepDeletion = (index) => {
    const newMethod = [...methodSteps].filter(
      (i, curIndex) => curIndex !== index
    );
    setMethodSteps(newMethod);
  };
  return (
    <>
      <Helmet>
        <title>Create a new recipe</title>
      </Helmet>
      <Backdrop open={showIngAdder} style={{ zIndex: 1001 }}>
        <IngAdder
          hide={() => setShowIngAdder(false)}
          addNewIngredient={addNewFoodIngredient}
          addNewMiscIngredient={addNewMiscIngredient}
        />
      </Backdrop>
      <Backdrop open={showMethodStepAdder} style={{ zIndex: 1001 }}>
        <MethodStepAdder
          addNewMethodStep={addNewMethodStep}
          hide={() => setShowMethodStepAdder(false)}
        />
      </Backdrop>
      <FormContainer
        title="Create a recipe"
        saveButtonText="Save recipe"
        cancel={history.goBack}
        submit={Form.submitForm}
        loading={loading}
      >
        <Box p={1} pl={0} pr={0}>
          <TextField
            value={Form.values.title}
            label="Title"
            type="text"
            id="title"
            name="title"
            variant="outlined"
            onChange={Form.handleChange}
            fullWidth
            size="small"
            required
          />
        </Box>
        {/* <Box display="flex" alignItems="center">
          <Box pr={2}>
            <Button component="label" color="primary" variant="outlined">
              Select {imageSelected ? "a different" : null} image
              <input
                type="file"
                hidden
                id="banner"
                name="banner"
                onChange={async (e) => {
                  console.log(e.currentTarget.files[0]);
                  await Form.setFieldValue("file", e.currentTarget.files[0]);
                  setImageSelected(true);
                }}
              />
            </Button>
          </Box>
          {imageSelected ? (
            <Button
              onClick={async () => {
                setImageSelected(false);
                Form.setFieldValue("file", "");
              }}
            >
              Remove image
            </Button>
          ) : null}

          {imageSelected ? <span>{Form.values.file.name}</span> : null}
        </Box> */}
        <Box p={1} pl={0} pr={0}>
          <TextField
            value={Form.values.description}
            type="text"
            multiline
            label="Description"
            variant="outlined"
            fullWidth
            id="description"
            name="description"
            onChange={Form.handleChange}
          />
        </Box>
        {/* <Box p={1} pl={0} display="flex" justifyContent="flex-start" pr={0}>
          <Box pr={1}>
            <FormControl fullWidth>
              <TextField
                value={Form.values.preptime}
                type="text"
                label="Preperation time"
                variant="outlined"
                onChange={Form.handleChange}
                id="preptime"
                name="preptime"
              />
              <FormHelperText>
                Time it takes to prepare this meal
              </FormHelperText>
            </FormControl>
          </Box>
          <FormControl>
            <TextField
              value={Form.values.cookingtime}
              type="text"
              label="Cooking time"
              variant="outlined"
              onChange={Form.handleChange}
              id="cookingtime"
              name="cookingtime"
            />
            <FormHelperText>Time it takes to cook this meal</FormHelperText>
          </FormControl>
        </Box> */}

        {/* <Box pb={2}>
          <Typography variant="subtitle1">Ingredients:</Typography>
          <List>
            {miscIngs.map((ing, index) => {
              return (
                <ListItem key={ing + 2.3 * Math.random}>
                  <ListItemText style={{ fontWeight: 700 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>
                        {ing.amount > 0 ? ing.amount : null}{" "}
                        {ing.measurement !== "" ? ing.measurement : null}{" "}
                        {ing.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleMiscIngDelete(index)}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </ListItemText>
                </ListItem>
              );
            })}
            {foodIngIngs.map((ing, index) => {
              return (
                <ListItem key={ing.ID}>
                  <ListItemText style={{ fontWeight: 700 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>
                        {ing.amount}
                        {ing.ServingUnit} {ing.Name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleFoodIngIngDelete(index)}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
          <Button
            color="primary"
            onClick={() => setShowIngAdder(true)}
            fullWidth
          >
            Add ingredient
          </Button>
        </Box>
        <Box pb={4}>
          <Typography>Method:</Typography>
          <List>
            {methodSteps.map((step, index) => {
              return (
                <ListItem key={step + String(index)}>
                  <ListItemText style={{ fontWeight: 700 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>{`Step ${index + 1}: ${step}`}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleMethodStepDeletion(index)}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
          <Button
            color="primary"
            onClick={() => setShowMethodStepAdder(true)}
            fullWidth
          >
            Add step
          </Button>
        </Box> */}
        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel id="toml">Type of recipe</InputLabel>
            <Select
              labelId="toml"
              fullWidth
              variant="outlined"
              //label="Type of recipe"
              id="typeOfRecipe"
              name="typeOfRecipe"
              value={Form.values.typeOfRecipe}
              onChange={Form.handleChange}
            >
              {["", "Breakfast", "Lunch", "Dinner", "Dessert", "Snack"].map(
                (item) => {
                  return (
                    <MenuItem key={item} value={item}>
                      {item ? item : "Unspecified"}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
        </Box>
      </FormContainer>
    </>
  );
};

export default AddRecipe;
