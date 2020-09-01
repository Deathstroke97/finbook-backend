import React from "react";
import PropTypes from "prop-types";
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

const useToolbarStyles = makeStyles(theme => ({
  root: {
    // paddingLeft: theme.spacing(2),
    // paddingRight: theme.spacing(1)
  },
  buttonRoot: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    textTransform: "none",
    marginLeft: 20
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: "rgba(255, 255, 255)"
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: "rgba(255, 255, 255)"
        },
  title: {
    // flex: "1 1 100%"
    marginRight: 8
  },
  buttonDeleteAccept: {
    background: theme.palette.error.main,
    textTransform: "none",
    color: theme.palette.common.white,
    "&:hover": {
      background: "#f77975"
    }
  },
  dialogRoot: {
    position: "absolute",
    width: 380,
    top: 0
  },
  paperWidthSm: {
    position: "absolute",
    width: 380,
    top: 0
  }
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    props.deleteOperations();
    setOpen(false);
  };

  return (
    <>
      <div>
        {numSelected > 0 ? (
          <Toolbar
            className={clsx(classes.root, {
              [classes.highlight]: numSelected > 0
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
            paperWidthSm: classes.paperWidthSm
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

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired
};

export default EnhancedTableToolbar;
