import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";

import { SessionContext } from "../../../context/SessionContext";
import * as actions from "store/actions/index";
import constants from "../../../constants/constants";
import periods from "../../../constants/periods";
import moment from "moment";

import FormControl from "@material-ui/core/FormControl";
import { useStyles } from "./style";
import DatePicker from "./raw";

import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

const DatePickerComponent = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { projectId, contractorId } = useParams();

  const filters = projectId
    ? props.projectFilters
    : contractorId
    ? props.contractorFilters
    : props.filters;

  const [duration, setDuration] = useState(filters.period);
  const [startTime, setStartTime] = useState(filters.startTime);
  const [endTime, setEndTime] = useState(filters.endTime);

  const handleFilterChange = (filter) => {
    const updatedFilters = {
      ...filters,
      ...filter,
    };
    if (projectId) {
      props.onUpdateProjectFilters(updatedFilters);
      props.onFetchProject(user.token, projectId, updatedFilters);
      return;
    }
    if (contractorId) {
      props.onUpdateContractorFilters(updatedFilters);
      props.onFetchContractor(user.token, contractorId, updatedFilters);
      return;
    }
    if (props.handleFiltersChange) {
      props.handleFiltersChange(updatedFilters);
    }
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
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    projectFilters: state.projects.project.filters,
    contractorFilters: state.contractors.contractor.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    //project
    onUpdateProjectFilters: (updatedFilters) =>
      dispatch(actions.updateProjectFilters(updatedFilters)),
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    //contractor
    onUpdateContractorFilters: (updatedFilters) =>
      dispatch(actions.updateContractorFilters(updatedFilters)),
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatePickerComponent);
