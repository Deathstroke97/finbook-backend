import React, { useState, useContext } from "react";
import * as actions from "store/actions";
import { SessionContext } from "context/SessionContext";
import axios from "axios-instance";
import { connect } from "react-redux";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import {
  categoryTypes,
  activities,
  isOwnerTransferIncome,
  isOwnerTransferOutcome,
} from "dummyData";
import constants from "constants/constants";

const Category = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { category } = props;
  const [name, setName] = useState(category.name);
  const [error, setError] = useState(null);

  const handleCategoryUpdate = (event) => {
    const category = {
      ...props.category,
      name: name,
    };
    axios
      .put(`/category/${category._id}`, category)
      .then((res) => {
        props.setDrawerState(false);
        props.fetchCategories();
      })
      .catch((error) => setError(error));
  };

  const handleCategoryDeletion = () => {
    axios
      .delete(`/category/${category._id}`)
      .then((res) => {
        props.setDrawerState(false);
        props.fetchCategories();
      })
      .catch((error) => setError(error));
  };

  const handleNameChange = (event, name) => {
    const value = event.target.value;
    setName(value);
  };

  return (
    <div className={classes.root}>
      <Box>
        <Typography className={classes.operationNameText}>Статья</Typography>

        <form noValidate autoComplete="off">
          <div className={classes.row}>
            <TextField
              id="outlined-multiline-flexible"
              label="Название статьи"
              required
              multiline
              rowsMax="1"
              value={name}
              onChange={handleNameChange}
              variant="outlined"
            />
          </div>
          <Box mt={1}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleCategoryUpdate}
              disabled={name === "" || category.isSystem}
            >
              Добавить
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.deleteButton}
              onClick={handleCategoryDeletion}
              disabled={category.isSystem}
            >
              Удалить
            </Button>
          </Box>
        </form>
      </Box>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchCategories: (token) => dispatch(actions.fetchCategories(token)),
  };
};

export default connect(null, mapDispatchToProps)(Category);
