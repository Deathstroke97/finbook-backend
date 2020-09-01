import React, { useState } from "react";
import { makeStyles, Button } from "@material-ui/core";
import TransactionCreator from "components/home/OperationWorkers/createTransaction";
import constants from "constants/constants";

import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import GetAppIcon from "@material-ui/icons/GetApp";
import Drawer from "@material-ui/core/Drawer";
import OperationWorker from "components/home/OperationWorkers/operationWorker";
import TransferWorker from "components/home/OperationWorkers/transferWorker";
import ContractorCreator from "components/common/create/contractor";
import ContractorUpdate from "components/common/update/contractor";
import ObligationCreator from "components/common/create/obligation";
import Box from "@material-ui/core/Box";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-start",
    flexDirection: "column",
    marginTop: "14px",
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
  const [drawerIsOpen, setDrawerState] = useState(false);
  const [action, setAction] = useState("");
  const { tabIndex, contractorsFilters } = props;

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
        {tabIndex == 0 ? (
          <>
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
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={(e) =>
              handleActionClick(e, true, constants.OPERATION_OBLIGATION)
            }
          >
            <AddIcon fontSize="small" />
            <p>Обязательство</p>
          </Button>
        )}

        <Button
          variant="contained"
          classes={{ root: classes.whiteButton }}
          onClick={(e) => handleActionClick(e, true, constants.ACTION_EDIT)}
          disabled={props.loading}
        >
          <p>Редактировать</p>
        </Button>
      </div>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleActionClick(e, false)}
      >
        {action == constants.ACTION_EDIT ? (
          <ContractorUpdate
            contractorsFilters={contractorsFilters}
            setDrawerState={setDrawerState}
          />
        ) : tabIndex == 0 ? (
          <TransactionCreator
            setDrawerState={setDrawerState}
            action={action}
            contractorsFilters={contractorsFilters}
          />
        ) : (
          <ObligationCreator
            setDrawerState={setDrawerState}
            contractorsFilters={contractorsFilters}
          />
        )}
      </Drawer>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.contractors.loading,
  };
};

export default connect(mapStateToProps, null)(Actions);
