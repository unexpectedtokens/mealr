// Photo by Lisa Fotios from Pexels https://www.pexels.com/photo/basil-leaves-and-avocado-on-sliced-bread-on-white-ceramic-plate-1351238/
// Photo by Ella Ollson from Pexels https://www.pexels.com/photo/top-view-of-food-1640772/
// Photo by Bulbfish from Pexels https://www.pexels.com/photo/sliced-tomato-and-avocado-on-white-plate-1143754/
// Photo by Jill Wellington from Pexels https://www.pexels.com/photo/close-up-of-salad-in-plate-257816/
//Photo by Anna Tukhfatullina Food Photographer/Stylist from Pexels https://www.pexels.com/photo/flatlay-photography-of-white-ceramic-bowl-2611817/
import { Fade, Typography } from "@material-ui/core";
import { useEffect } from "react";

const About = (props) => {
  useEffect(() => {
    props.setActiveRoute("about");
    //eslint-disable-next-line
  }, []);
  return (
    <Fade in={true}>
      <Typography>About</Typography>
    </Fade>
  );
};

export default About;
