import React, { useState } from "react";

import constants from "constants/constants";
import clsx from "clsx";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import { useStyles } from "./style";
import DatePicker from "components/common/DatePicker/datePicker";

const Filters = (props) => {
  const classes = useStyles();
  const { handleFiltersChange } = props;
  const [filters, setFilters] = useState(props.filters);

  // const handleChange = (name) => (event) => {
  //   setState({ ...state, [name]: event.target.checked });
  // };

  const handleReportByChange = (reportBy) => {
    const updatedFilters = {
      ...filters,
      reportBy,
    };
    setFilters(updatedFilters);
    handleFiltersChange(updatedFilters);
  };

  const handleCountPlannedChange = () => {
    const updatedFilters = {
      ...filters,
      countPlanned: !filters.countPlanned,
    };
    setFilters(updatedFilters);
    handleFiltersChange(updatedFilters);
  };

  const handleDateChange = (updatedFilters) => {
    setFilters(updatedFilters);
    handleFiltersChange(updatedFilters);
  };

  return (
    <div className={classes.root}>
      <div className={classes.firstRowFilter}>
        <DatePicker
          filters={props.filters}
          handleFiltersChange={handleDateChange}
        />

        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.countPlanned}
                // onChange={handleChange("checkedA")}
                onChange={handleCountPlannedChange}
                value="countPlanned"
                color="primary"
              />
            }
            label="Учитывать плановые операции"
            classes={{
              label: classes.label,
            }}
          />
        </FormGroup>
      </div>
      <div className={classes.secondRowFilter}>
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
                filters.reportBy === constants.CATEGORY && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleReportByChange(constants.CATEGORY)}
          >
            По статьям
          </Button>
          <Button
            classes={{
              root: clsx(
                classes.button,
                filters.reportBy === constants.ACTIVITY && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleReportByChange(constants.ACTIVITY)}
          >
            По видам деятельности
          </Button>
          <Button
            classes={{
              root: clsx(
                classes.button,
                filters.reportBy === constants.ACCOUNT && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleReportByChange(constants.ACCOUNT)}
          >
            По счетам
          </Button>
          <Button
            classes={{
              root: clsx(
                classes.button,
                filters.reportBy === constants.CONTRACTOR &&
                  classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleReportByChange(constants.CONTRACTOR)}
          >
            По контрагентам
          </Button>
          <Button
            classes={{
              root: clsx(
                classes.button,
                filters.reportBy === constants.PROJECT && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleReportByChange(constants.PROJECT)}
          >
            По проектам
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default Filters;
