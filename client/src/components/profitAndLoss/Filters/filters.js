import React, { useState } from "react";

import constants from "constants/constants";
import clsx from "clsx";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import periods from "constants/periods";

import { useStyles } from "./style";
import DatePicker from "components/common/DatePicker/datePicker";

const Filters = (props) => {
  const classes = useStyles();
  const { handleFiltersChange } = props;
  const [filters, setFilters] = useState(props.filters);

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

  const handleMethodChange = (method) => {
    const updatedFilters = {
      ...filters,
      method,
    };
    setFilters(updatedFilters);
    handleFiltersChange(updatedFilters);
  };

  const handleDateChange = (updatedFilters) => {
    setFilters(updatedFilters);
    handleFiltersChange(updatedFilters);
  };

  console.log("in filters: ", filters);

  return (
    <div className={classes.root}>
      <div className={classes.firstRowFilter}>
        <DatePicker filters={filters} handleFiltersChange={handleDateChange} />
        <Box ml={2}>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.countPlanned}
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
        </Box>
      </div>
      <div className={classes.secondRowFilter}>
        <ButtonGroup
          variant="contained"
          classes={{
            grouped: classes.buttonGroup,
            contained: classes.contained,
          }}
          aria-label="reportBy buttons"
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
                filters.reportBy === constants.PROJECT && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleReportByChange(constants.PROJECT)}
          >
            По проектам
          </Button>
        </ButtonGroup>
        <ButtonGroup
          variant="contained"
          classes={{
            grouped: classes.buttonGroup,
            contained: classes.contained,
          }}
          aria-label="method buttons"
        >
          <Button
            classes={{
              root: clsx(
                classes.button,
                filters.method === constants.METHOD_ACCRUAL &&
                  classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleMethodChange(constants.METHOD_ACCRUAL)}
          >
            Метод начисления
          </Button>
          <Button
            classes={{
              root: clsx(
                classes.button,
                filters.method === constants.METHOD_CASH && classes.activeButton
              ),
              label: classes.buttonLabel,
            }}
            onClick={() => handleMethodChange(constants.METHOD_CASH)}
          >
            Кассовый метод
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default Filters;
