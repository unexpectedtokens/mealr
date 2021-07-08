import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router";
import config from "../../../../../Config/config";
import FormContainer from "../../../../Reusables/App/FormContainer";
const AddRecipe = ({ navigate, handleAuthenticatedEndpointRequest }) => {
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
          TypeOfMeal: values.typeOfRecipe,
          Description: values.description,
        };
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

  return (
    <>
      <Helmet>
        <title>Create a new recipe</title>
      </Helmet>
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
