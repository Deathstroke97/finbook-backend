import React, { useContext } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";

import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Box } from "@material-ui/core";

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    // paddingLeft: theme.spacing(2),
    // paddingRight: theme.spacing(1)
  },
  buttonRoot: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    textTransform: "none",
    marginLeft: 20,
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: "rgba(255, 255, 255)",
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: "rgba(255, 255, 255)",
        },
  title: {
    // flex: "1 1 100%"
    marginRight: 8,
  },
  buttonDeleteAccept: {
    background: theme.palette.error.main,
    textTransform: "none",
    color: theme.palette.common.white,
    "&:hover": {
      background: "#f77975",
    },
  },
  dialogRoot: {
    position: "absolute",
    width: 380,
    top: 0,
  },
  paperWidthSm: {
    position: "absolute",
    width: 380,
    top: 0,
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { user } = useContext(SessionContext);
  const { projectId, contractorId } = useParams();
  const { selected, numSelected } = props;
  const filters = projectId
    ? props.projectFilters
    : contractorId
    ? props.contractorFilters
    : props.filters;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    let callback = function () {
      props.onFetchTransactions(user.token, filters);
    };
    if (projectId) {
      callback = function () {
        props.onFetchProject(user.token, projectId, filters);
        props.onFetchProjects(user.token, props.projectsFilters);
      };
    }
    if (contractorId) {
      callback = function () {
        props.onFetchContractor(user.token, contractorId, filters);
        props.onFetchContractors(user.token, props.contractorsFilters);
      };
    }
    props.onDeleteTransactions(user.token, selected, callback);
    props.setSelected([]);
    setOpen(false);
    props.setChecked(false);
  };

  return (
    <>
      <div>
        {numSelected > 0 ? (
          <Toolbar
            className={clsx(classes.root, {
              [classes.highlight]: numSelected > 0,
            })}
          >
            <Typography
              className={classes.title}
              color="inherit"
              // variant="subtitle1"
            >
              {numSelected} выбрано
            </Typography>
            <IconButton aria-label="delete">
              <DeleteIcon color="error" onClick={handleClickOpen} />
            </IconButton>
          </Toolbar>
        ) : null}
      </div>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          classes={{
            paperWidthSm: classes.paperWidthSm,
          }}
        >
          <DialogTitle id="alert-dialog-title">
            {numSelected > 1
              ? "Удалить эти операции ?"
              : "Удалить эту операцию ?"}
          </DialogTitle>
          {/* <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Let Google help apps determine location. This means sending
              anonymous location data to Google, even when no apps are running.
            </DialogContentText>
          </DialogContent> */}
          <DialogActions>
            <Box pb={1}>
              <Button
                onClick={handleDelete}
                className={classes.buttonDeleteAccept}
                variant="contained"
              >
                Да, удалить
              </Button>
              <Button onClick={handleClose} color="primary" autoFocus>
                Нет
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    filters: state.transactions.filters,
    projectFilters: state.projects.project.filters,
    contractorFilters: state.contractors.contractor.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onDeleteTransactions: (token, transactions, callback) =>
      dispatch(actions.deleteTransactions(token, transactions, callback)),
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
    //projects
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
    //contractors
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnhancedTableToolbar);
