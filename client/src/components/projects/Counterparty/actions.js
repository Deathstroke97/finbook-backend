import React, { useState } from "react";
import { makeStyles, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import GetAppIcon from "@material-ui/icons/GetApp";
import Drawer from "@material-ui/core/Drawer";
import OperationWorker from "./node_modules/components/home/OperationWorker/operationWorker";
import TransferWorker from "./node_modules/components/home/OperationWorker/transferWorker";
import ProjectCreate from "./node_modules/components/common/create/project";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-start",
    flexDirection: "column"
  },
  mainButtonsContainer: {
    "& > button": {
      textTransform: "none",
      "&:not(:last-child)": {
        marginRight: 10
      }
    }
  },
  buttonContainer: {
    display: "flex",
    marginTop: 14,
    "& > button": {
      textTransform: "none",
      "&:not(:last-child)": {
        marginRight: 10
      },
      "& svg": {
        marginLeft: "-8px",
        marginRight: "7px"
      }
    }
  },
  whiteButton: {
    backgroundColor: "#fff",
    "& img": {
      width: "15px",
      height: "20px",
      marginRight: "10px",
      marginLeft: "-4px"
    }
  }
}));

const Actions = props => {
  const classes = useStyles();
  const [drawerIsOpen, setDrawerState] = useState(false);
  const [action, setAction] = useState("");

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

  return (
    <div className={classes.root}>
      <div className={classes.mainButtonsContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={e => handleActionClick(e, true, "edit")}
        >
          <p>Редактировать</p>
        </Button>
        <Button
          variant="contained"
          classes={{ root: classes.whiteButton }}
          onClick={e => console.log("export have not yet supported")}
        >
          Завершить
        </Button>
      </div>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={e => handleActionClick(e, true, "income")}
        >
          <AddIcon fontSize="small" />
          <p>Приход</p>
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={e => handleActionClick(e, true, "expense")}
        >
          <RemoveIcon fontSize="small" />
          Расход
        </Button>

        <Button
          variant="contained"
          classes={{ root: classes.whiteButton }}
          onClick={e => console.log("export have not yet supported")}
        >
          <GetAppIcon fontSize="small" />
          Экспорт
        </Button>
      </div>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={e => handleActionClick(e, false)}
      >
        {action == "edit" ? (
          <ProjectCreate editing />
        ) : (
          <OperationWorker setDrawerState={setDrawerState} action={action} />
        )}
      </Drawer>
    </div>
  );
};

export default Actions;
