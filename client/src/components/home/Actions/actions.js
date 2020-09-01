import React, { useState } from "react";
import { makeStyles, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import GetAppIcon from "@material-ui/icons/GetApp";
import Drawer from "@material-ui/core/Drawer";
import TransactionCreator from "components/home/OperationWorkers/createTransaction";
import TransferWorker from "components/home/OperationWorkers/transferWorker";
import constants from "constants/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-start",
    marginTop: "15px",
  },
  buttonContainer: {
    display: "flex",
    "& > button": {
      textTransform: "none",
      // color: "white",
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
        {/* <Button
          variant="contained"
          color="primary"
          onClick={(e) => handleActionClick(e, true, "transfer")}
        >
          <SyncAltIcon fontSize="small" />
          Перевод
        </Button> */}
        {/* <Button
          variant="contained"
          classes={{ root: classes.whiteButton }}
          onClick={(e) => console.log("import have not yet supported")}
        >
          <img src="/icons/upload2.svg" alt="" />
          Импорт
        </Button>

        <Button
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
        {action === "transfer" ? (
          <TransferWorker setDrawerState={setDrawerState} />
        ) : (
          <TransactionCreator setDrawerState={setDrawerState} action={action} />
        )}
      </Drawer>
    </div>
  );
};

export default Actions;
