import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions/index";

import Actions from "./actions";
import Cards from "../Cards/cards";
import Graphs from "components/common/Graphs/graphs";
import Table from "components/common/Table/table";
import DatePicker from "components/common/DatePicker/datePicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const Project = (props) => {
  const classes = useStyles();
  const { projectId } = useParams();
  const { user } = useContext(SessionContext);
  const { filters, projectsFilters, transactions } = props;

  useEffect(() => {
    props.onFetchProject(user.token, projectId, filters);
  }, []);
  console.log("transactions: project", transactions);

  return (
    <div className={classes.root}>
      <DatePicker />
      <Actions projectsFilters={projectsFilters} />
      <Cards />
      <Graphs transactions={transactions} />
      <Table projectsFilters={projectsFilters} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    filters: state.projects.project.filters,
    transactions: state.projects.project.transactions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
