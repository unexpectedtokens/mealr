import { Fade, Grid } from "@material-ui/core";
import { useState } from "react";

function RecImg(props) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Grid item lg={6} md={6} sm={6} xs={6}>
      <Fade in={imgLoaded}>
        <img
          className={props.className}
          src={props.src}
          onLoad={() => setImgLoaded(true)}
          alt={props.alt}
        />
      </Fade>
    </Grid>
  );
}

export default RecImg;
