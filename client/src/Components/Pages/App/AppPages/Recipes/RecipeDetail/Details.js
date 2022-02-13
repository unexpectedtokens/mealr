import React from "react";
import { makeStyles, Box, Grow, Typography } from "@material-ui/core";

import styled from "styled-components";
import PlaceHolderImage from "../../../../../../assets/images/pexels-anna-tukhfatullina-food-photographerstylist-2611817.jpeg";

import Like from "./Likes";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    background: theme.palette.primary.main,
    display: "flex",
    alignItems: "flex-end",
    minHeight: "150px",
    width: "100%",
    borderRadius: "15px",
    paddingLeft: "40px",
    position: "relative",
    marginBottom: "100px",
    [theme.breakpoints.down("sm")]: {
      paddingLeft: "15px",
    },
  },
  image: {
    width: "150px",
    height: "150px",
    borderRadius: "100%",
    backgroundColor: "#fff",
    marginRight: "20px",
    transform: "translateY(25%)",
    display: "flex",
    justifyContent: "stretch",
    alignItems: "stretch",
    overflow: "hidden",
    border: "10px solid #fff",
    [theme.breakpoints.down("sm")]: {
      width: 120,
      height: 120,
    },
  },
  recipeTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 30,
    [theme.breakpoints.down("sm")]: {
      fontSize: 20,
    },
  },
  recipeCreator: {
    color: "#FFE693",
    fontSize: 20,
    [theme.breakpoints.down("sm")]: {
      fontSize: 15,
    },
  },

  likeDisplayText: {
    color: theme.palette.secondary.main,
  },
}));

const RecipeAvatar = styled.div`
  background: url(${(props) => props.image});
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: 100%;
`;

function RecipeDetails({
  handleAuthenticatedEndpointRequest,
  data,
  userIsOwner,
  recipeid,
}) {
  const classes = useStyles();

  return (
    <Grow in={true}>
      <Box className={classes.mainContainer}>
        <Like
          handleAuthenticatedEndpointRequest={
            handleAuthenticatedEndpointRequest
          }
          recipeid={recipeid}
        />

        <Box className={classes.image}>
          <RecipeAvatar
            image={
              data.ImageURL
                ? "https://lembasbucket.s3.eu-central-1.amazonaws.com/" +
                  data.ImageURL
                : PlaceHolderImage
            }
            alt={data.Title}
          />
        </Box>
        <Box py={2}>
          <Typography variant="h1" className={classes.recipeTitle}>
            {data.Title}
          </Typography>
          <Typography className={classes.recipeCreator}>
            Created by {userIsOwner ? "You" : data.Owner.username}
          </Typography>
        </Box>
      </Box>
    </Grow>
  );
}

export default RecipeDetails;
