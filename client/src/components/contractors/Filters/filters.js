import React, { useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import constants from "../../../constants/constants";
import periods from "../../../constants/periods";
import { connect } from "react-redux";
import * as actions from "store/actions";

import TextField from "@material-ui/core/TextField";
import { useStyles } from "./style";
import DatePicker from "./datePicker";
import FormControl from "@material-ui/core/FormControl";

import moment from "moment";

import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

const Filters = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { filters, handleFiltersChange } = props;
  console.log("filters: ", filters);
  const [duration, setDuration] = useState(filters.period);
  const [startTime, setStartTime] = useState(filters.startTime);
  const [endTime, setEndTime] = useState(filters.endTime);
  const [name, setName] = useState("");

  const handleDurationChange = (event) => {
    const value = event.target.value;
    setDuration(event.target.value);
    const startTime = periods[value].startTime;
    const endTime = periods[value].endTime;
    setStartTime(startTime);
    setEndTime(endTime);
    handleFiltersChange({
      startTime: startTime,
      endTime: endTime,
      period: value,
    });
  };

  const handleStartTimeChange = (dateISO) => {
    const date = moment(dateISO).format("YYYY-MM-DD");
    setStartTime(date);
    handleFiltersChange({
      startTime: date,
      endTime: endTime,
    });
  };

  const handleEndTimeChange = (dateISO) => {
    const date = moment(dateISO).format("YYYY-MM-DD");
    setEndTime(date);
    handleFiltersChange({
      startTime: startTime,
      endTime: date,
    });
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
        <FormControl variant="outlined" className={classes.formControl}>
          <DatePicker
            handleDurationChange={handleDurationChange}
            duration={duration}
          />
        </FormControl>
        {duration === constants.RANDOM_TIME ? (
          <div className={classes.row}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid item>
                <KeyboardDatePicker
                  required
                  style={{ marginTop: 4, width: "100%" }}
                  disableToolbar
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Дата"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </Grid>
            </MuiPickersUtilsProvider>

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid item>
                <KeyboardDatePicker
                  required
                  style={{ marginTop: 4, width: "100%" }}
                  disableToolbar
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Дата"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </Grid>
            </MuiPickersUtilsProvider>
          </div>
        ) : null}

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
      </div>
    </div>
  );
};

// const mapStateToProps = (state) => {
//   return {
//     filters: state.contractors.filters,
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   return {
//     // onFetchTransactions: (token, filters) =>
//     //   dispatch(actions.fetchTransactions(token, filters)),
//     onUpdateFilters: (filters) => dispatch(actions.updateFilters(filters)),
//   };
// };

export default Filters;

// export default connect(null, mapDispatchToProps)(Filters);
