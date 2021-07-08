import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import RecipeCard from "./RecipeCard";
import { Fragment } from "react";
import config from "../../../../../Config/config";
const RecipeList = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    navigate,
    url,
    handleAuthenticatedEndpointRequest,
    handleAddToFavourites,
    handleRemoveFromFavourites,
  } = props;

  const history = useHistory();
  const client = useQueryClient();
  const fetchRecipeList = async ({ pageParam = 0 }) => {
    return new Promise(async (resolve, reject) => {
      const response = await handleAuthenticatedEndpointRequest(
        `${url}?offset=${pageParam}`,
        "GET"
      );
      if (response.status !== 200) {
        enqueueSnackbar("Something went wrong fetching recipes", {
          variant: "error",
        });
        reject(response.status);
      }
      const data = await response.json();
      const isNextPage = data.length >= 10;
      const page = {
        recipes: data,
        nextPage: isNextPage ? pageParam + 10 : undefined,
      };
      return resolve(page);
    });
  };

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
  } = useInfiniteQuery("recipes", fetchRecipeList, {
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage;
    },
  });
  if (isError) {
    enqueueSnackbar(
      "Something went wrong fetching recipes, please try again later."
    );
    return history.goBack();
  }
  const handleLikeButtonClick = async (id) => {
    try {
      await handleAddToFavourites(id);
      const newPagesArray = data.pages.map((page) => {
        page.recipes = page.recipes.map((rec) => {
          if (rec.ID === id) {
            rec.Likes += 1;
            rec.LikedByUser = true;
          }
          return rec;
        });
        return page;
      });
      client.setQueryData("recipes", (data) => ({
        pages: newPagesArray,
        pageParams: data.pageParams,
      }));
    } catch (e) {
      throw new Error(e);
    }
  };
  const handleDislikeButtonClick = async (id) => {
    const favPage = `${config.API_URL}/api/recipes/listfav/` === url;
    try {
      await handleRemoveFromFavourites(id);
      const newPagesArray = data.pages.map((page) => {
        if (favPage) {
          page.recipes = page.recipes.filter((rec) => rec.ID !== id);
        } else {
          page.recipes = page.recipes = page.recipes.map((rec) => {
            if (rec.ID === id) {
              rec.Likes -= 1;
              rec.LikedByUser = false;
            }
            return rec;
          });
        }

        return page;
      });
      client.setQueryData("recipes", (data) => ({
        pages: newPagesArray,
        pageParams: data.pageParams,
      }));
    } catch (e) {
      throw new Error(e);
    }
  };

  return (
    <Box maxHeight="80vh" overflow="scroll" pt={3}>
      {isFetching && !isFetchingNextPage ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid
            container
            direction="row"
            spacing={2}
            alignContent="flex-start"
            alignItems="flex-start"
          >
            {data.pages?.map((page, i) => (
              <Fragment key={i}>
                {page.recipes?.map((rec, index) => {
                  return (
                    <RecipeCard
                      handleLikeButtonClick={handleLikeButtonClick}
                      handleDislikeButtonClick={handleDislikeButtonClick}
                      recipe={rec}
                      key={rec.ID}
                      navigate={navigate}
                      index={index}
                      pageIndex={i}
                    />
                  );
                })}
              </Fragment>
            ))}
          </Grid>
          {data.pages.length === 0 ? (
            <Box
              py={30}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="h6">
                No recipes were found. Why dont you try making one:
              </Typography>
              <Box pt={5}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => navigate("/recipes/create")}
                  disableElevation={true}
                >
                  Create a recipe
                </Button>
              </Box>
            </Box>
          ) : null}

          {hasNextPage && data.pages.length > 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              py={4}
              color="secondary"
            >
              <Button onClick={fetchNextPage} variant="outlined">
                See more recipes
              </Button>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default RecipeList;
