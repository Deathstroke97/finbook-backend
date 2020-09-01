import React, { useState, useContext } from "react";
import { SessionContext } from "../../../context/SessionContext";
import * as actions from "store/actions";
import { Typography } from "@material-ui/core";
import { connect } from "react-redux";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import clsx from "clsx";
import { useStyles } from "./style";
import DatePicker from "components/common/DatePicker/raw";

import constants from "../../../constants/constants";
import periods from "../../../constants/periods";
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
  const [account, setAccount] = useState(
    props.filters.account === "" ? constants.ALL : props.filters.account
  );
  const [duration, setDuration] = useState(props.filters.period);
  const [startTime, setStartTime] = useState(props.filters.startTime);
  const [endTime, setEndTime] = useState(props.filters.endTime);

  const [operationType, setOperationType] = useState(
    props.filters.type === "" ? constants.ALL : props.filters.type
  );

  const handleFilterChange = (filter) => {
    const updatedFilters = {
      ...props.filters,
      ...filter,
    };
    console.log("updatedFilters: ", updatedFilters);
    props.onUpdateFilters(updatedFilters);
    props.onFetchTransactions(user.token, updatedFilters);
  };

  const handleAccountChange = (event) => {
    const { value } = event.target;
    const account = value === constants.ALL ? "" : value;

    setAccount(event.target.value);
    handleFilterChange({ account: account });
  };

  const handleDurationChange = (event) => {
    const value = event.target.value;
    setDuration(event.target.value);
    const startTime = periods[value].startTime;
    const endTime = periods[value].endTime;
    setStartTime(startTime);
    setEndTime(endTime);
    handleFilterChange({
      startTime: startTime,
      endTime: endTime,
      period: value,
    });
  };

  const handleStartTimeChange = (dateISO) => {
    const date = moment(dateISO).format("YYYY-MM-DD");
    setStartTime(date);
    handleFilterChange({
      startTime: date,
      endTime: endTime,
    });
  };

  const handleEndTimeChange = (dateISO) => {
    const date = moment(dateISO).format("YYYY-MM-DD");
    setEndTime(date);
    handleFilterChange({
      startTime: startTime,
      endTime: date,
    });
  };

  const handleButtonClick = (type) => {
    setOperationType(type);
    handleFilterChange({
      type: type === constants.ALL ? "" : type,
    });
  };

  return (
    <div className={classes.root}>
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

      <FormControl variant="outlined" className={classes.formControl}>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={account}
          onChange={handleAccountChange}
        >
          {props.accounts.map((account) => (
            <MenuItem value={account._id} key={account._id}>
              <Typography className={classes.menuItemText}>
                {account.name}
              </Typography>
            </MenuItem>
          ))}
          <MenuItem value={constants.ALL}>
            <Typography className={classes.menuItemText}>Все</Typography>
          </MenuItem>
        </Select>
      </FormControl>
      <ButtonGroup
        variant="contained"
        classes={{
          grouped: classes.buttonGroup,
          contained: classes.contained,
        }}
        aria-label="contained  button group"
      >
        <Button
          classes={{
            root: clsx(
              classes.button,
              operationType === constants.OPERATION_INCOME &&
                classes.activeButton
            ),
            label: classes.buttonLabel,
          }}
          onClick={() => handleButtonClick(constants.OPERATION_INCOME)}
        >
          Приходы
        </Button>
        <Button
          classes={{
            root: clsx(
              classes.button,
              operationType === constants.OPERATION_OUTCOME &&
                classes.activeButton
            ),
            label: classes.buttonLabel,
          }}
          onClick={() => handleButtonClick(constants.OPERATION_OUTCOME)}
        >
          Расходы
        </Button>
        <Button
          classes={{
            root: clsx(
              classes.button,
              operationType === constants.ALL && classes.activeButton
            ),
            label: classes.buttonLabel,
          }}
          onClick={() => handleButtonClick(constants.ALL)}
        >
          Все
        </Button>
      </ButtonGroup>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts.accounts,
    filters: state.transactions.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
    onUpdateFilters: (filters) => dispatch(actions.updateFilters(filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
