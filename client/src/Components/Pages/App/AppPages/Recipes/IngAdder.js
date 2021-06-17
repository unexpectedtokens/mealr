import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import config from "../../../../../Config/config";

const useStyles = makeStyles((theme) => ({
  Container: {
    minWidth: "50%",
  },
  SuggestionBox: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    zIndex: 6,
    top: "100%",
    maxHeight: 150,
    overflow: "scroll",
  },
}));

const IngAdder = ({ addNewIngredient, hide, addNewMiscIngredient }) => {
  const [foIng, setFoIng] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [ingSelected, setIngSelected] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState({});
  const [searchVal, setSearchVal] = useState("");
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [focus, setFocus] = useState(true);
  const [amount, setAmount] = useState(0);
  const classes = useStyles();
  const timer = useRef(null);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    amount: 0,
    measurement: "",
  });
  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch(
        `${config.API_URL}/api/recipes/allingredients/?ingredient=${searchVal}`
      );
      const data = await response.json();
      setSuggestions(data);
      console.log(data);
      setLoadingSuggestions(false);
    } catch {
      setLoadingSuggestions(false);
    }
  };

  const handleSearchValueChanged = (val) => {
    setSearchVal(val);
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    if (val.length > 0) {
      timer.current = setTimeout(fetchSuggestions, 1000);
    } else {
      setSuggestions([]);
    }
  };

  const handleHide = () => {
    setSearchVal("");
    setIngSelected(false);
    setSelectedIngredient({});
    setSuggestions([]);
    setAmount(0);
    setShowSuggestionBox(false);
    setFocus(false);
    setNewIngredient({ name: "", amount: 0, measurement: "" });
    hide();
  };

  const handleIngredientAddition = () => {
    addNewIngredient({
      ...selectedIngredient,
      amount,
      FoodIngredientID: selectedIngredient.ID,
    });

    handleHide();
  };
  const handleMiscIngredientAddition = () => {
    addNewMiscIngredient(newIngredient);
    handleHide();
  };
  useEffect(() => {
    if (suggestions.length > 0 || focus) {
      setShowSuggestionBox(true);
    } else {
      setShowSuggestionBox(false);
    }
  }, [suggestions.length, focus]);

  return (
    <Paper className={classes.Container}>
      <Box p={3}>
        {foIng ? (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="column"
            >
              <Box mb={1} position="relative">
                <TextField
                  type="text"
                  variant="outlined"
                  value={searchVal}
                  onChange={(e) => handleSearchValueChanged(e.target.value)}
                  label="search for recipe"
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  fullWidth
                />
                {loadingSuggestions ? (
                  <Box
                    position="absolute"
                    right="5%"
                    top="50%"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <CircularProgress />
                  </Box>
                ) : null}
                {showSuggestionBox && suggestions.length > 0 ? (
                  <Box p={1} className={classes.SuggestionBox}>
                    <List>
                      {suggestions.map((sug) => {
                        return (
                          <ListItem
                            key={sug.ID}
                            button
                            onClick={() => {
                              setSelectedIngredient(sug);
                              setIngSelected(true);
                              setSearchVal("");
                              setShowSuggestionBox(false);
                            }}
                          >
                            {sug.Name}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                ) : null}
              </Box>
              {searchVal.length === 0 ? (
                <>
                  <Typography align="center">or</Typography>
                  <Button onClick={() => setFoIng(false)}>
                    Add your own ingredient
                  </Button>
                </>
              ) : null}
            </Box>
            <Box pt={3} pb={3}>
              {ingSelected ? (
                <Box>
                  <Box display="flex" alignItems="center">
                    <Box pr={1}>
                      <TextField
                        size="small"
                        type="number"
                        value={amount}
                        variant="outlined"
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                      />
                    </Box>
                    <Typography>
                      {selectedIngredient.ServingUnit} of{" "}
                      <span style={{ fontWeight: 700 }}>
                        {selectedIngredient.Name}
                      </span>
                    </Typography>
                  </Box>
                </Box>
              ) : null}
            </Box>
            <Button
              variant="contained"
              color={ingSelected && amount > 0 ? "primary" : "disabled"}
              fullWidth
              disabled={amount < 1}
              style={{ fontWeight: 700 }}
              onClick={handleIngredientAddition}
            >
              Add ingredient
            </Button>
            <Box pt={1}>
              <Button fullWidth onClick={handleHide} color="secondary">
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <Box>
            <Box mb={2}>
              <TextField
                type="text"
                label="Name"
                name="name"
                id="name"
                variant="outlined"
                fullWidth
                onChange={(e) =>
                  setNewIngredient((cur) => ({ ...cur, name: e.target.value }))
                }
                value={newIngredient.name}
              />
              <Box display="flex" justifyContent="flex-start" my={2}>
                <Box mr={1}>
                  <TextField
                    type="number"
                    variant="outlined"
                    label="Amount"
                    name="amount"
                    id="amount"
                    value={newIngredient.amount}
                    onChange={(e) =>
                      setNewIngredient((cur) => ({
                        ...cur,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                  />
                </Box>
                <TextField
                  type="text"
                  label="Measuring unit"
                  variant="outlined"
                  name="measurement"
                  id="measurement"
                  value={newIngredient.measurement}
                  onChange={(e) =>
                    setNewIngredient((cur) => ({
                      ...cur,
                      measurement: e.target.value,
                    }))
                  }
                />
              </Box>
            </Box>
            {newIngredient.name.length < 1 ? (
              <Box display="flex" flexDirection="column" mb={3}>
                <Typography align="center">or</Typography>
                <Button onClick={() => setFoIng(true)}>
                  Search for an ingredient
                </Button>
              </Box>
            ) : null}

            <Button
              variant="contained"
              color={newIngredient.name.length >= 2 ? "primary" : "disabled"}
              fullWidth
              disabled={newIngredient.name.length < 2}
              style={{ fontWeight: 700 }}
              onClick={handleMiscIngredientAddition}
            >
              Add ingredient
            </Button>
            <Box pt={1}>
              <Button fullWidth onClick={handleHide} color="secondary">
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default IngAdder;
