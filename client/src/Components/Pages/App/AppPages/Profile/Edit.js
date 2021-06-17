import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grow,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@material-ui/core";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useHistory } from "react-router";
import config from "../../../../../Config/config";
import FormContainer from "../../../../Reusables/App/FormContainer";

const fetchActivityOptions = async () => {
  const response = await fetch(
    `${config.API_URL}/api/profile/getactivityoptions/`
  );
  return response.json();
};

function ProfileEdit({
  validForMG,
  refetch,
  handleAuthenticatedEndpointRequest,
  profile,
  path,
}) {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const updateProfile = (newProfile) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await handleAuthenticatedEndpointRequest(
          `${config.API_URL}/api/profile/update/`,
          "PUT",
          newProfile
        );
        if (response.status === 200) {
          return resolve();
        }
      } catch (e) {
        return reject(e);
      }
    });
  };

  const mutation = useMutation(updateProfile, {
    onSuccess: () => {
      console.log("update 200");
      refetch();
      enqueueSnackbar("Profile update succesful", { variant: "success" });
      history.push(path);
    },
    onError: (error) => {
      enqueueSnackbar(
        "Something went wrong updating your profile. Please try again at a later time",
        { variant: "error" }
      );
      history.push(path);
    },
  });
  const Form = useFormik({
    initialValues: {
      weight: 0,
      height: 0,
      gender: "male",
      dob: "2021-02-15",
      loa: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      const data = { ...values };
      const dob = new Date(data.dob);
      data.dob = dob.toISOString();
      mutation.mutate(JSON.stringify(data));
    },
  });

  const updateFieldsBasedOnProfile = async (data) => {
    const date = new Date(data.Dob);
    const cfd = `${date.getFullYear()}-${date.getMonth() < 10 ? "0" : ""}${
      date.getMonth() + 1
    }-${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
    await Form.setFieldValue("height", data.Height);
    await Form.setFieldValue("weight", data.Weight);
    await Form.setFieldValue("gender", data.Gender);
    await Form.setFieldValue("dob", cfd);
    await Form.setFieldValue("loa", data.Loa);
  };

  const { data: loaOptions, isLoading: loaLoading } = useQuery(
    "loa",
    fetchActivityOptions
  );

  const discardChanges = () => {
    history.goBack();
  };
  const handleRadioButtonPressed = async (key, val) => {
    await Form.setFieldValue(key, val);
  };

  useEffect(() => {
    updateFieldsBasedOnProfile(profile);
    //eslint-disable-next-line
  }, []);
  return (
    <Grow in={!loading}>
      {!mutation.isLoading ? (
        <FormContainer
          cancel={discardChanges}
          submit={Form.handleSubmit}
          title="Update your profile"
          saveButtonText="Save profile"
        >
          {/* <Box
                p={}
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
              > */}
          {validForMG ? (
            <Typography color="primary">
              Your profile is ready for mealplan generation
            </Typography>
          ) : (
            <Typography>
              You need to fill in some extra things in order for mealgeneration
              to work
            </Typography>
          )}
          <Box p={2} pl={0}>
            <TextField
              value={Form.values.height}
              onChange={Form.handleChange}
              type="number"
              id="height"
              name="height"
              label="Height in CM"
            />
          </Box>
          <Box p={2} pl={0}>
            <TextField
              value={Form.values.weight}
              onChange={Form.handleChange}
              type="number"
              id="weight"
              name="weight"
              label="Weight in KG"
            />
          </Box>

          <Box p={2} pl={0}>
            <TextField
              value={Form.values.dob}
              onChange={Form.handleChange}
              type="date"
              id="dob"
              name="dob"
              label="Date of Birth"
            />
          </Box>
          {loaLoading ? (
            <CircularProgress />
          ) : (
            <Box p={2}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Level of Activity</FormLabel>
                <RadioGroup aria-label="loa" name="loa">
                  {Object.keys(loaOptions).map((op) => {
                    const option = loaOptions[op];
                    return (
                      <FormControlLabel
                        key={op}
                        onClick={() => handleRadioButtonPressed("loa", op)}
                        value={Form.values.loa}
                        control={
                          <Radio
                            checked={op === Form.values.loa}
                            centerRipple
                            color="primary"
                          />
                        }
                        label={`${
                          op[0].toUpperCase() + op.slice(1, op.length)
                        }: ${option.Description}`}
                        checked={op === Form.values.loa}
                        name="loa"
                        id="loa"
                      />
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          <Box p={2}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup aria-label="gender" name="gender">
                {["male", "female"].map((op) => {
                  return (
                    <FormControlLabel
                      key={op}
                      onClick={() => handleRadioButtonPressed("gender", op)}
                      value={Form.values.gender}
                      control={
                        <Radio
                          checked={op === Form.values.gender}
                          centerRipple
                          color="primary"
                        />
                      }
                      label={`${op[0].toUpperCase() + op.slice(1, op.length)}`}
                      checked={op === Form.values.gender}
                      name="gender"
                      id="gender"
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Box>
        </FormContainer>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Grow>
  );
}

export default ProfileEdit;
