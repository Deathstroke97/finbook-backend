import React, { useState } from "react";
import constants from "constants/constants";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import TextField from "@material-ui/core/TextField";
import clsx from "clsx";
import { useStyles } from "./style";

const Filters = (props) => {
  const classes = useStyles();
  const { filters, handleFiltersChange } = props;
  const [projectType, setProjectType] = useState(filters.type);
  const [name, setName] = useState("");

  const handleProjectTypeChange = (type) => {
    setProjectType(type);
    const updatedFilters = {
      ...filters,
      type: type,
    };
    handleFiltersChange(updatedFilters);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    const updatedFilters = {
      ...filters,
      name: value,
    };
    handleFiltersChange(updatedFilters);
  };

  return (
    <div className={classes.root}>
      <div>
        <ButtonGroup
          variant="contained"
          classes={{
            grouped: classes.buttonGroup,
            contained: classes.contained,
          }}
          aria-label="contained button group"
        >
          <Button
            classes={{
              root: clsx(
                classes.button,
                projectType === constants.UNCOMPLETED && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleProjectTypeChange(constants.UNCOMPLETED)}
          >
            Только незавершенные
          </Button>
          <Button
            classes={{
              root: clsx(
                classes.button,
                projectType === constants.ALL && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleProjectTypeChange(constants.ALL)}
          >
            Все проекты
          </Button>
        </ButtonGroup>
        <Box ml={2}>
          <TextField
            id="outlined-search"
            label="Поиск по названию"
            type="search"
            variant="outlined"
            size="small"
            classes={{
              root: classes.textFieldRoot,
            }}
            value={name}
            onChange={handleNameChange}
          />
        </Box>
      </div>
    </div>
  );
};

export default Filters;
