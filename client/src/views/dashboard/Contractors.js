import React, { useEffect, useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { connect } from "react-redux";
import constants from "constants/constants";

import * as actions from "store/actions";
import { makeStyles } from "@material-ui/core";
import Filters from "components/contractors/Filters/filters";
import Table from "components/contractors/Table/table";
import Contractor from "components/contractors/Contractor/contractor";
import { Switch, Route, useRouteMatch, useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Actions from "components/contractors/Actions/actions";
import { isBusinessActive } from "utils/functions";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const Contractors = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const match = useRouteMatch();
  const history = useHistory();
  const { contractors, totalItems, loading } = props;

  const [filters, setFilters] = useState({
    period: constants.ALL_TIME,
    startTime: null,
    endTime: null,
    page: 0,
    rowsPerPage: 5,
    name: "",
  });

  useEffect(() => {
    if (!isBusinessActive(user)) {
      history.push("/settings");
      return;
    }
    props.onFetchContractors(user.token, filters);
  }, [filters]);

  const handleFiltersChange = (filter) => {
    const updatedFilters = {
      ...filters,
      ...filter,
    };
    setFilters(updatedFilters);
  };

  return (
    <div className={classes.root}>
      <Switch>
        <Route path={`${match.path}/:contractorId`}>
          <Contractor contractorsFilters={filters} />
        </Route>
        <Route path={match.path}>
          <Box>
            <Filters
              filters={filters}
              handleFiltersChange={handleFiltersChange}
            />
            <Actions contractorsFilters={filters} />
            <Table
              filters={filters}
              contractors={contractors}
              totalItems={totalItems}
              loading={loading}
              handleFiltersChange={handleFiltersChange}
            />
          </Box>
        </Route>
      </Switch>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    contractors: state.contractors.contractors.contractors,
    totalItems: state.contractors.contractors.totalItems,
    loading: state.contractors.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Contractors);
