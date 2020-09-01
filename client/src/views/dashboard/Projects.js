import React, { useEffect, useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { connect } from "react-redux";
import constants from "constants/constants";
import * as actions from "store/actions";

import { makeStyles, Container, Typography } from "@material-ui/core";
import Filters from "components/projects/Filters/filters";
import Table from "components/projects/Table/table";
import Project from "components/projects/Project/project";
import {
  Switch,
  Route,
  Link,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import Box from "@material-ui/core/Box";
import Actions from "components/projects/Actions/actions";
import { isBusinessActive } from "utils/functions";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const Projects = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(SessionContext);
  const match = useRouteMatch();
  const [filters, setFilters] = useState({
    type: constants.UNCOMPLETED,
    page: 0,
    rowsPerPage: 3,
    name: "",
  });
  const { projects, totalItems, loading } = props;

  useEffect(() => {
    if (!isBusinessActive(user)) {
      history.push("/settings");
      return;
    }
    props.onFetchProjects(user.token, filters);
  }, [filters]);

  const handleFiltersChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  return (
    <div className={classes.root}>
      <Switch>
        <Route path={`${match.path}/:projectId`}>
          <Project projectsFilters={filters} />
        </Route>
        <Route path={match.path}>
          <Box>
            <Filters
              filters={filters}
              handleFiltersChange={handleFiltersChange}
            />
            <Actions filters={filters} />
            <Table
              filters={filters}
              projects={projects}
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
    projects: state.projects.projects.projects,
    totalItems: state.projects.projects.totalItems,
    loading: state.projects.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
