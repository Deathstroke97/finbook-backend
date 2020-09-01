import React, { useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Box } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import constants from "../../../constants/constants";

const useStyles = makeStyles((theme) => ({
  menuItemText: {
    fontWeight: 400,
    color: theme.palette.secondary.text,
    fontSize: 14,
  },
}));

const DatePicker = (props) => {
  const classes = useStyles();
  const { duration, handleDurationChange } = props;

  return (
    <Select
      labelId="demo-simple-select-outlined-label"
      id="demo-simple-select-outlined"
      value={duration}
      onChange={handleDurationChange}
    >
      <MenuItem value={constants.CURRENT_MONTH}>
        <Typography className={classes.menuItemText}>Текущий месяц</Typography>
      </MenuItem>
      <MenuItem value={constants.CURRENT_QUARTER}>
        <Typography className={classes.menuItemText}>
          Текущий квартал
        </Typography>
      </MenuItem>
      <MenuItem value={constants.CURRENT_YEAR}>
        <Typography className={classes.menuItemText}>Текущий год</Typography>
      </MenuItem>
      <Box mt={1} mb={1}>
        <Divider />
      </Box>
      <MenuItem value={constants.LAST_MONTH}>
        <Typography className={classes.menuItemText}>Прошлый месяц</Typography>
      </MenuItem>
      <MenuItem value={constants.LAST_QUARTER}>
        <Typography className={classes.menuItemText}>
          Прошлый квартал
        </Typography>
      </MenuItem>
      <MenuItem value={constants.LAST_YEAR}>
        <Typography className={classes.menuItemText}>Прошлый год</Typography>
      </MenuItem>
      <Box mt={1} mb={1}>
        <Divider />
      </Box>
      <MenuItem value={constants.RANDOM_TIME}>
        <Typography className={classes.menuItemText}>
          Произвольный период
        </Typography>
      </MenuItem>
      <Box mt={1} mb={1}>
        <Divider />
      </Box>
      <MenuItem value={constants.ALL_TIME}>
        <Typography className={classes.menuItemText}>Все время</Typography>
      </MenuItem>
    </Select>
  );
};

export default DatePicker;
