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
      serves: 1,
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const submitData = {
          Title: values.title,
          Serves: parseInt(values),
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

        <Box mb={2}>
          <TextField
            value={Form.values.serves}
            onChange={Form.handleChange}
            type="number"
            id="serves"
            name="serves"
            variant="outlined"
            fullWidth
            size="small"
            required
            label="How many people does this recipe serve?"
          />
        </Box>
      </FormContainer>
    </>
  );
};

export default AddRecipe;
