import React, { useEffect, useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { useHistory } from "react-router-dom";
import axios from "axios-instance";
import { makeStyles } from "@material-ui/core";
import constants from "constants/constants";
import * as moment from "moment";
import "moment/locale/ru";
import Filters from "components/cashFlow/Filters/filters";
import Actions from "components/cashFlow/Actions/actions";
import Table from "components/cashFlow/Table/table";
import periods from "constants/periods";
import { isBusinessActive } from "utils/functions";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const CashFlow = () => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const history = useHistory();
  const [filters, setFilters] = useState({
    reportBy: constants.CATEGORY,
    period: constants.CURRENT_QUARTER,
    startTime: periods[constants.CURRENT_QUARTER].startTime,
    endTime: periods[constants.CURRENT_QUARTER].endTime,
    countPlanned: false,
  });

  const handleFiltersChange = (updatedFilters) => {
    if (updatedFilters.period === constants.ALL_TIME) {
      updatedFilters = {
        ...updatedFilters,
        startTime: moment(`${user.businessCreationDate}`),
        endTime: moment(),
      };
    }
    setFilters(updatedFilters);
    setReport(null);
  };

  useEffect(() => {
    if (!isBusinessActive(user)) {
      history.push("/settings");
      return;
    }
    axios
      .post("/report/cashflow", {
        reportBy: filters.reportBy,
        queryData: {
          createTime: {
            $gte: filters.startTime,
            $lte: filters.endTime,
          },
        },
        countPlanned: filters.countPlanned,
      })
      .then((res) => {
        setReport(res.data.result);
      })
      .catch((error) => setError(error));
  }, [filters]);

  console.log("report: ", report);
  return (
    <div className={classes.root}>
      <Filters filters={filters} handleFiltersChange={handleFiltersChange} />
      <Actions />
      <Table report={report} filters={filters} />
    </div>
  );
};

export default CashFlow;
