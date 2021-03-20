import {
  Paper,
  TextField,
  Typography,
  Grow,
  Box,
  RadioGroup,
  FormControl,
  Radio,
  FormControlLabel,
  FormLabel,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import config from "../../../../../Config/config";

function Profile({ auth, validForMG, checkValidForMG }) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const [loaOptions, setLoaOptions] = useState({});
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loaOptionsLoaded, setLoaOptionsLoaded] = useState(false);

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
      try {
        const response = await fetch(`${config.API_URL}/api/profile/update/`, {
          method: "PUT",
          headers: {
            Authorization: auth.Key,
          },
          body: JSON.stringify(data),
        });
        if (response.status === 200) {
          fetchProfile();
        }
      } catch (e) {
        console.log(e);
      }
    },
  });

  const updateFieldsBasedOnProfile = async (data) => {
    const date = new Date(data.Dob);
    console.log(date);
    const cfd = `${date.getFullYear()}-${date.getMonth() < 10 ? "0" : null}${
      date.getMonth() + 1
    }-${date.getDate() < 10 ? "0" : null}${date.getDate()}`;
    await Form.setFieldValue("height", data.Height);
    await Form.setFieldValue("weight", data.Weight);
    await Form.setFieldValue("gender", data.Gender);
    await Form.setFieldValue("dob", cfd);
    await Form.setFieldValue("loa", data.Loa);
    //eslint-disable-next-line
  };

  const fetchProfile = useCallback(async () => {
    if (auth.Key !== "") {
      setProfileLoaded(false);
      const response = await fetch(`${config.API_URL}/api/profile/`, {
        method: "GET",
        headers: {
          Authorization: auth.Key,
        },
      });
      const data = await response.json();
      console.log(data);
      setProfile(data);
      updateFieldsBasedOnProfile(data);
      checkValidForMG(auth.Key);
      setProfileLoaded(true);
    }
    //eslint-disable-next-line
  }, [auth.Key]);

  const fetchActivityOptions = useCallback(async () => {
    console.log("fetching activity options");
    const response = await fetch(
      `${config.API_URL}/api/profile/getactivityoptions/`
    );
    const data = await response.json();
    setLoaOptions(data);
    setLoaOptionsLoaded(true);
  }, []);
  const discardChanges = () => {
    setLoading(true);
    updateFieldsBasedOnProfile(profile);
    setLoading(false);
  };
  const handleRadioButtonPressed = async (key, val) => {
    await Form.setFieldValue(key, val);
  };
  useEffect(() => {
    if (profileLoaded && loaOptionsLoaded) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [profileLoaded, loaOptionsLoaded]);
  useEffect(() => {
    fetchProfile();
    fetchActivityOptions();
    return () => {
      setLoaOptionsLoaded(false);
      setProfileLoaded(false);
      setLoading(true);
    };
    //eslint-disable-next-line
  }, []);
  return (
    <>
      <Grow in={!loading}>
        <Paper>
          {!loading ? (
            <form onSubmit={Form.handleSubmit}>
              <Box
                p={3}
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
              >
                <Typography variant="h4">Profile</Typography>
                {validForMG ? (
                  <Typography color="primary">
                    Your profile is ready for mealplan generation
                  </Typography>
                ) : (
                  <Typography>
                    You need to fill in some extra things in order for
                    mealgeneration to work
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
                <Box p={2}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Gender</FormLabel>
                    <RadioGroup aria-label="gender" name="gender">
                      {["male", "female"].map((op) => {
                        return (
                          <FormControlLabel
                            key={op}
                            onClick={() =>
                              handleRadioButtonPressed("gender", op)
                            }
                            value={Form.values.gender}
                            control={
                              <Radio
                                checked={op === Form.values.gender}
                                centerRipple
                                color="primary"
                              />
                            }
                            label={`${
                              op[0].toUpperCase() + op.slice(1, op.length)
                            }`}
                            checked={op === Form.values.gender}
                            name="gender"
                            id="gender"
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                </Box>
                <Box alignSelf="flex-end" display="flex">
                  <Box pr={2}>
                    <Button onClick={discardChanges}>Discard Changes</Button>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={Form.handleSubmit}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              </Box>
            </form>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
        </Paper>
      </Grow>
    </>
  );
}

export default Profile;
