import React, { useState, useContext, useEffect } from "react";
import { SessionContext } from "context/SessionContext";
import axios from "axios-instance";
import { filterCategoriesByType } from "utils/functions";
import { makeStyles, Typography, Box } from "@material-ui/core";
import CategoryEditor from "components/common/update/category";
import Drawer from "@material-ui/core/Drawer";
import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useStyles } from "./style";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";

const Categories = (props) => {
  const classes = useStyles();
  const context = useContext(SessionContext);
  const [categories, setCategories] = useState(null);
  const [categoryToChange, setCategoryToChange] = useState(null);
  const [drawerIsOpen, setDrawerState] = useState(false);

  const fetchCategories = () => {
    axios.get("/categories").then((res) => {
      const categories = filterCategoriesByType(res.data.categories);
      setCategories(categories);
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setDrawerState(true);
    setCategoryToChange(category);
  };

  const incomeCategories =
    categories &&
    categories.incomeCategories.map((category) => (
      <li onClick={(e) => handleCategoryClick(category)}>{category.name}</li>
    ));

  const outcomeCategories =
    categories &&
    categories.outcomeCategories.map((category) => (
      <li onClick={(e) => handleCategoryClick(category)}>{category.name}</li>
    ));

  return (
    <div className={classes.root}>
      <div className={classes.column}>
        <Typography variant="h5">Cтатьи доходов</Typography>
        <ul>{incomeCategories}</ul>
      </div>
      <div className={classes.column}>
        <Typography variant="h5">Cтатьи расходов</Typography>
        <ul>{outcomeCategories}</ul>
      </div>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => setDrawerState(false)}
      >
        <CategoryEditor
          setDrawerState={setDrawerState}
          category={categoryToChange}
          fetchCategories={fetchCategories}
        />
      </Drawer>
    </div>
  );
};

export default Categories;
