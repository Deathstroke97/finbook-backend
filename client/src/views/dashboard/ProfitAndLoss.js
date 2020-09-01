import React, { useEffect, useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";

import { useHistory } from "react-router-dom";

import axios from "axios-instance";
import { makeStyles } from "@material-ui/core";
import constants from "constants/constants";
import * as moment from "moment";
import "moment/locale/ru";
import periods from "constants/periods";
import Filters from "components/profitAndLoss/Filters/filters";
import Actions from "components/profitAndLoss/Actions/actions";
import Table from "components/profitAndLoss/Table/table";
import { isBusinessActive } from "utils/functions";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const ProfitAndLoss = () => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const history = useHistory();

  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    period: constants.CURRENT_QUARTER,
    startTime: periods[constants.CURRENT_QUARTER].startTime,
    endTime: periods[constants.CURRENT_QUARTER].endTime,
    countPlanned: false,
    reportBy: constants.CATEGORY,
    method: constants.METHOD_ACCRUAL,
  });

  const handleFiltersChange = (updatedFilters) => {
    if (updatedFilters.period === constants.ALL_TIME) {
      updatedFilters = {
        ...updatedFilters,
        startTime: moment(`${user.businessCreationDate}`),
        endTime: moment(),
      };
    }
    console.log("updatedFilters: p&l", updatedFilters);
    setFilters(updatedFilters);
    setReport(null);
  };

  useEffect(() => {
    if (!isBusinessActive(user)) {
      history.push("/settings");
      return;
    }
    axios
      .post("/report/profitAndLoss", {
        reportBy: filters.reportBy,
        queryData: {
          createTime: {
            $gte: filters.startTime,
            $lte: filters.endTime,
          },
        },
        countPlanned: filters.countPlanned,
        method: filters.method,
      })
      .then((res) => {
        setReport(res.data.result);
        console.log("profitAndLoss report: ", res.data.result);
      })
      .catch((error) => setError(error));
  }, [filters]);
  return (
    <div className={classes.root}>
      <Filters filters={filters} handleFiltersChange={handleFiltersChange} />
      <Actions />
      <Table report={report} filters={filters} />
    </div>
  );
};

export default ProfitAndLoss;
