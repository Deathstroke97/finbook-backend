import React, { useState, useContext, useEffect } from "react";
import { connect } from "react-redux";
import { useHistory, Redirect } from "react-router-dom";
import axios from "axios-instance";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import { Box } from "@material-ui/core";

import { useParams } from "react-router-dom";

const Project = (props) => {
  const classes = useStyles();
  // const history = useHistory();

  const { editing } = props;
  const { projectsFilters, filters } = props;
  const { projectId } = useParams();
  const { user } = useContext(SessionContext);

  const [project, setProject] = useState(props.project);
  const [error, setError] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const handleProjectUpdate = (event) => {
    const project = {
      name: project.name,
      description: project.description,
      planIncome: project.planIncome,
      planOutcome: project.planOutcome,
      isFinished: project.isFinished,
    };
    axios
      .put(`/project/${projectId}`, project)
      .then((res) => {
        props.onFetchProject(user.token, projectId, filters);
        props.onFetchProjects(user.token, projectsFilters);
        props.setDrawerState(false);
        // history.push(`/projects/${projectId}`);
      })
      .catch((error) => {
        setError(error);
      });
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    const updatedProject = {
      ...project,
      [name]: value,
    };
    setProject(updatedProject);
  };

  const handleProjectDeletion = () => {
    axios
      .delete(`/project/${projectId}`)
      .then((res) => {
        props.onFetchProjects(user.token, projectsFilters);
        setRedirect(true);
        props.setDrawerState(false);
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (redirect) return <Redirect to={"/projects"} />;
  console.log("project update: ", project);
  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        {editing ? "Проект" : "Добавить новый проект"}
      </Typography>

      <form noValidate autoComplete="off">
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Название"
            required
            multiline
            rowsMax="1"
            value={project.name}
            onChange={(e) => handleChange(e, "name")}
            variant="outlined"
          />
        </div>
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Описание"
            required
            multiline
            rowsMax="1"
            value={project.description}
            onChange={(e) => handleChange(e, "description")}
            variant="outlined"
          />
        </div>
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Плановый приход"
            required
            multiline
            rowsMax="1"
            value={project.planIncome}
            onChange={(e) => handleChange(e, "planIncome")}
            variant="outlined"
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Плановый расход"
            required
            multiline
            rowsMax="1"
            value={project.planOutcome}
            onChange={(e) => handleChange(e, "planOutcome")}
            variant="outlined"
          />
        </div>
        <Box justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleProjectUpdate}
          >
            Сохранить
          </Button>
          {projectId ? (
            <Button
              onClick={handleProjectDeletion}
              className={classes.buttonDeleteAccept}
              variant="contained"
              className={classes.deleteButton}
            >
              Удалить
            </Button>
          ) : null}
        </Box>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    project: state.projects.project.project,
    filters: state.projects.project.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
