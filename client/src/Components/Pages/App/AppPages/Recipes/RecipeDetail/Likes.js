import React, { useState } from "react";
import { Typography, IconButton } from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import styled from "styled-components";
//import PlaceHolderImage from "../../../../../../assets/images/pexels-anna-tukhfatullina-food-photographerstylist-2611817.jpeg";
import { useQueryClient, useQuery } from "react-query";
import config from "../../../../../../Config/config";
import { useSnackbar } from "notistack";

const LikeContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
  display: flex;
  align-items: center;
  color: #fff;
  svg {
    fill: #fff;
  }
`;

const handleAddToFavourites = async (
  id,
  handleAuthenticatedEndpointRequest
) => {
  return new Promise(async (resolve, reject) => {
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/like/${id}`,
      "POST"
    );
    if (response.status !== 200) {
      throw new Error(response.status);
    } else {
      return resolve("ok");
    }
  });
};
const handleRemoveFromFavourites = async (
  id,
  handleAuthenticatedEndpointRequest
) => {
  return new Promise(async (resolve, reject) => {
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/like/${id}`,
      "DELETE"
    );
    if (response.status !== 200) {
      throw new Error(response.status);
    } else {
      return resolve("ok");
    }
  });
};

const checkIfLikedByUser = async (
  recipeid,
  handleAuthenticatedEndpointRequest
) => {
  return new Promise(async (resolve, reject) => {
    const response = await handleAuthenticatedEndpointRequest(
      `${config.API_URL}/api/recipes/likedbyuser/${recipeid}`,
      "GET"
    );
    if (response.status === 200) {
      resolve({ liked: true });
    } else if (response.status === 404) {
      resolve({ liked: false });
    } else {
      reject("error checking if liked by user");
    }
  });
};
const getAllLikesFromRecipe = async (recipeid) => {
  const response = await fetch(
    `${config.API_URL}/api/recipes/detail/${recipeid}/likes`
  );
  return response.json();
};

function Like({ recipeid, handleAuthenticatedEndpointRequest }) {
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);
  const likedByUserQuery = useQuery(
    "likedByUser",
    async () =>
      await checkIfLikedByUser(recipeid, handleAuthenticatedEndpointRequest)
  );
  const totalLikesQuery = useQuery(
    "likes",
    async () => await getAllLikesFromRecipe(recipeid)
  );
  const client = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const handleLikeButtonClicked = async () => {
    // console.log("likebutton");
    setLikeButtonDisabled(true);
    try {
      await handleAddToFavourites(recipeid, handleAuthenticatedEndpointRequest);
      client.setQueryData("likedByUser", { liked: true });
      client.setQueryData("likes", (old) => ({ Likes: old.Likes + 1 }));
      enqueueSnackbar("Succesfully added the recipe to your favourites");
    } catch (e) {
      enqueueSnackbar(
        "Something went wrong adding this recipe to your favourites"
      );
    }
    setLikeButtonDisabled(false);
  };
  const handleDislikeButtonClicked = async () => {
    //console.log("dislikeButton");
    setLikeButtonDisabled(true);
    try {
      await handleRemoveFromFavourites(
        recipeid,
        handleAuthenticatedEndpointRequest
      );
      client.setQueryData("likedByUser", { liked: false });
      client.setQueryData("likes", (old) => ({ Likes: old.Likes - 1 }));
      enqueueSnackbar("Succesfully removed the recipe from your favourites");
    } catch (e) {
      enqueueSnackbar(
        "Something went wrong removing this recipe from your favourites"
      );
    }
    setLikeButtonDisabled(false);
  };

  return (
    <LikeContainer>
      {!totalLikesQuery.isLoading &&
      !totalLikesQuery.isError &&
      !likedByUserQuery.isLoading &&
      !likedByUserQuery.isError ? (
        <>
          <IconButton
            disabled={likeButtonDisabled}
            onClick={
              likedByUserQuery.data.liked
                ? handleDislikeButtonClicked
                : handleLikeButtonClicked
            }
          >
            {likedByUserQuery.data.liked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography>{totalLikesQuery.data.Likes}</Typography>
        </>
      ) : null}
    </LikeContainer>
  );
}

export default Like;

// {likedByUserQuery.data.liked ? (
//     <Star />
//   ) : (
//     <StarBorderOutlined />
//   )}
// </IconButton>
// <Typography component="span">
//   {totalLikesQuery.data.Likes}
