import { Box, Button, Paper } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useQueryClient } from "react-query";
import config from "../../../../../../Config/config";

const ImageUpload = ({
  close,
  handleAuthenticatedEndpointRequest,
  recipeid,
}) => {
  const [image, setImage] = useState(null);
  const [imageValid, setImageValid] = useState(false);
  const queryClient = useQueryClient();

  const { enqueueSnackbar } = useSnackbar();
  const Submit = async () => {
    const fd = new FormData();

    fd.append("banner", image);
    console.log(fd.get("banner"));
    try {
      // const response = await handleAuthenticatedEndpointRequest(
      //   `${config.API_URL}/api/recipes/detail/${recipeid}/addbanner`,
      //   "POST",
      //   fd,
      //   "multipart/form-data"
      // );
      var url = `http://localhost:8080/api/recipes/detail/${recipeid}/addbanner`;
      console.log(recipeid, url);
      const response = await fetch(url, {
        method: "POST",
        body: fd,
      });
      console.log(response);
      // const data = await response.json();
      // queryClient.setQueryData("recipe", (old) => ({
      //   ...old,
      //   ImageURL: data.Filename,
      // }));
    } catch (e) {
      console.log("something went wrong", e);
    }
    // close();
  };

  const handleImageChange = (file) => {
    console.log(file);
    const filesizeInKB = file.size / 1000;
    // if (filesizeInKB < 550) {
    //   if (file.type === "image/png" || file.type === "image/jpeg") {
    setImage(file);
    setImageValid(true);
    //   } else {
    //     enqueueSnackbar("Invalid filetype: only jpeg or png are accepted", {
    //       variant: "error",
    //     });
    //     setImageValid(false);
    //   }
    // } else {
    //   enqueueSnackbar("File is too large", {
    //     variant: "error",
    //   });
    //   setImageValid(false);
    // }
  };
  return (
    <Paper>
      <Box p={2} flexDirection="column" display="flex" alignItems="stretch">
        <Box p={4} pb={4}>
          <input
            type="file"
            onChange={(e) => handleImageChange(e.target.files[0])}
          />
        </Box>
        <Button
          disabled={!imageValid}
          onClick={Submit}
          color="primary"
          variant="outlined"
        >
          Update image
        </Button>
      </Box>
    </Paper>
  );
};

export default ImageUpload;
