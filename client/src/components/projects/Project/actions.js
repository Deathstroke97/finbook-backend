import React, { useState, useContext } from "react";
import axios from "axios-instance";
import { connect } from "react-redux";
import constants from "constants/constants";
import * as actions from "store/actions";
import { useParams } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import { makeStyles, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import GetAppIcon from "@material-ui/icons/GetApp";
import Drawer from "@material-ui/core/Drawer";
import ProjectUpdate from "components/common/update/project";
import TransactionCreator from "components/home/OperationWorkers/createTransaction";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-start",
    flexDirection: "row",
    marginTop: 14,
  },
  mainButtonsContainer: {
    "& > button": {
      textTransform: "none",
      "&:not(:last-child)": {
        marginRight: 10,
      },
    },
  },
  buttonContainer: {
    display: "flex",
    "& > button": {
      textTransform: "none",
      "&:not(:last-child)": {
        marginRight: 10,
      },
      "& svg": {
        marginLeft: "-8px",
        marginRight: "7px",
      },
    },
  },
  whiteButton: {
    backgroundColor: "#fff",
    "& img": {
      width: "15px",
      height: "20px",
      marginRight: "10px",
      marginLeft: "-4px",
    },
  },
}));

const Actions = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  let { projectId } = useParams();
  const [drawerIsOpen, setDrawerState] = useState(false);
  const [action, setAction] = useState("");
  const [error, setError] = useState(null);
  const { projectsFilters, filters, project, loading } = props;

  const [isFinished, setIsFinished] = useState(
    props.project && props.project.isFinished
  );

  const handleActionClick = (event, open, actionType) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerState(open);
    if (actionType) setAction(actionType);
  };

  const handleProjectStatusChange = () => {
    const projectToUpdate = {
      name: project.name,
      description: project.description,
      planIncome: project.planIncome,
      planOutcome: project.planOutcome,
      isFinished: !props.project.isFinished,
    };
    axios
      .put(`/project/${projectId}`, projectToUpdate, {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      })
      .then((res) => {
        setIsFinished(!isFinished);
        // props.onClearProjectState();
        props.onFetchProject(user.token, projectId, filters);
        props.onFetchProjects(user.token, projectsFilters);
        setDrawerState(false);
        // history.push(`/projects/${projectId}`);
      })
      .catch((error) => {
        setError(error);
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={(e) =>
            handleActionClick(e, true, constants.OPERATION_INCOME)
          }
        >
          <AddIcon fontSize="small" />
          <p>Приход</p>
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={(e) =>
            handleActionClick(e, true, constants.OPERATION_OUTCOME)
          }
        >
          <RemoveIcon fontSize="small" />
          Расход
        </Button>

        <Button
          variant="contained"
          classes={{ root: classes.whiteButton }}
          onClick={(e) => handleActionClick(e, true, "edit")}
          disabled={loading}
        >
          <p>Редактировать</p>
        </Button>
        {props.project && (
          <Button
            variant="contained"
            classes={{ root: classes.whiteButton }}
            onClick={handleProjectStatusChange}
          >
            <p>{props.project.isFinished ? "Возобновить" : "Завершить"}</p>
          </Button>
        )}

        {/* <Button
          variant="contained"
          classes={{ root: classes.whiteButton }}
          onClick={(e) => console.log("export have not yet supported")}
        >
          <GetAppIcon fontSize="small" />
          Экспорт
        </Button> */}
      </div>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleActionClick(e, false)}
      >
        {action == "edit" ? (
          <ProjectUpdate
            editing
            projectsFilters={projectsFilters}
            setDrawerState={setDrawerState}
          />
        ) : (
          <TransactionCreator
            setDrawerState={setDrawerState}
            action={action}
            projectsFilters={projectsFilters}
          />
        )}
      </Drawer>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    project: state.projects.project.project,
    filters: state.projects.project.filters,
    loading: state.projects.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
    onClearProjectState: () => dispatch(actions.clearProjectInState()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
