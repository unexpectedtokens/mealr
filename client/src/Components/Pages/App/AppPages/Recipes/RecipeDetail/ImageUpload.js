import { Box, Button, Paper } from "@material-ui/core";
import { useState } from "react";
import { useQueryClient } from "react-query";
import config from "../../../../../../Config/config";

const ImageUpload = ({
  close,
  handleAuthenticatedEndpointRequest,
  recipeid,
  recipename,
}) => {
  const [image, setImage] = useState(null);
  const queryClient = useQueryClient();
  const Submit = async () => {
    console.log(image);
    const fd = new FormData();

    fd.append("banner", image);
    console.log(fd.get("banner"));
    try {
      const response = await handleAuthenticatedEndpointRequest(
        `${config.API_URL}/api/recipes/detail/${recipeid}/addbanner`,
        "POST",
        fd,
        "multipart/form-data"
      );
      const data = await response.json();
      console.log(data);
      queryClient.setQueryData("recipe", (old) => ({
        ...old,
        ImageURL: data.Filename,
      }));
    } catch (e) {
      console.log("something went wrong", e);
    }
    close();
  };
  return (
    <Paper>
      <Box p={2}>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <Button disabled={image === null} onClick={Submit}>
          Update image
        </Button>
      </Box>
    </Paper>
  );
};

export default ImageUpload;
