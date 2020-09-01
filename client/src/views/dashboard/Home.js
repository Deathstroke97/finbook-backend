import React, { useState, useContext, useEffect } from "react";
import { connect } from "react-redux";

import { makeStyles } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import { SessionContext } from "context/SessionContext";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { isBusinessActive } from "utils/functions";
import Filters from "components/home/Filters/filters";
import Actions from "components/home/Actions/actions";
import Cards from "components/common/Cards/cards";
import Graphs from "components/common/Graphs/graphs";
import Table from "components/common/Table/table";
import * as actions from "store/actions";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  linearProgress: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

const DashBoard = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(SessionContext);

  useEffect(() => {
    if (!isBusinessActive(user)) {
      history.push("/settings");
      return;
    }
    props.onFetchAccounts(user.token);
    props.onFetchProjects(user.token);
    props.onFetchContractors(user.token);
    props.onFetchCategories(user.token);
    props.onFetchTransactions(user.token, props.filters);
  }, []);

  let spinner = (
    <div className={classes.linearProgress}>
      <LinearProgress />
    </div>
  );

  if (props.loadingFinished && !props.initialLoading) {
    spinner = (
      <div className={classes.root}>
        <Filters />
        <Actions />
        <Cards />
        <Graphs />
        <Table />
      </div>
    );
  }
  return <>{spinner}</>;
};

const mapStateToProps = (state) => {
  return {
    loadingFinished:
      !state.accounts.loading &&
      !state.categories.loading &&
      !state.projects.loading &&
      !state.contractors.loading,

    initialLoading:
      state.accounts.initialLoading &&
      state.categories.initialLoading &&
      state.projects.initialLoading &&
      state.contractors.initialLoading,
    filters: state.transactions.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchAccounts: (token) => dispatch(actions.fetchAccounts(token)),
    onFetchProjects: (token) => dispatch(actions.fetchProjects(token)),
    onFetchContractors: (token) => dispatch(actions.fetchContractors(token)),
    onFetchCategories: (token) => dispatch(actions.fetchCategories(token)),
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
    onUpdateFilters: (filters) => dispatch(actions.updateFilters(filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashBoard);
