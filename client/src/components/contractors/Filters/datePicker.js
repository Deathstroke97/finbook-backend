import React, { useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Box } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import constants from "constants/constants";

const useStyles = makeStyles((theme) => ({
  menuItemText: {
    fontWeight: 400,
    color: theme.palette.secondary.text,
    fontSize: "14px",
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
        <Typography className={classes.menuItemText}>В этом месяце</Typography>
      </MenuItem>
      <MenuItem value={constants.CURRENT_QUARTER}>
        <Typography className={classes.menuItemText}>
          В этом квартале
        </Typography>
      </MenuItem>
      <MenuItem value={constants.CURRENT_YEAR}>
        <Typography className={classes.menuItemText}>В этом году</Typography>
      </MenuItem>
      <Box mt={1} mb={1}>
        <Divider />
      </Box>
      <MenuItem value={constants.LAST_MONTH}>
        <Typography className={classes.menuItemText}>
          В прошлом месяце
        </Typography>
      </MenuItem>
      <MenuItem value={constants.LAST_QUARTER}>
        <Typography className={classes.menuItemText}>
          В прошлом квартале
        </Typography>
      </MenuItem>
      <MenuItem value={constants.LAST_YEAR}>
        <Typography className={classes.menuItemText}>В прошлом году</Typography>
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
        <Typography className={classes.menuItemText}>
          Все контрагенты
        </Typography>
      </MenuItem>
    </Select>
  );
};

export default DatePicker;
