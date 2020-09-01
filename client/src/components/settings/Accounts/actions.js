import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import AccountCreator from "components/common/create/account";
import CashboxCreator from "components/common/create/cashbox";
import AddIcon from "@material-ui/icons/Add";
import Drawer from "@material-ui/core/Drawer";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > button:not(last-child)": {
      marginRight: 14,
      backgroundColor: theme.palette.common.white,
      border: "1px solid rgba(0,0,0,0.1)",
      boxShadow: theme.shadows[1],

      backgroundColor: "rgb(101, 84, 171)",
      color: theme.palette.common.white,
      "&:hover": {
        background: "rgba(128,114, 183,1 )",
      },
      "& svg": {
        marginRight: 7,
      },
    },
  },
}));

const Actions = (props) => {
  const classes = useStyles();
  const [drawerIsOpen, setDrawerState] = useState(false);
  const [creationType, setCreationType] = useState(null);

  const handleActionClick = (event, open) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerState(open);
  };

  const handleAccountCreation = () => {
    setCreationType("account");
    setDrawerState(true);
  };

  const handleCashBoxCreation = () => {
    setCreationType("cashBox");
    setDrawerState(true);
  };

  return (
    <div className={classes.root}>
      <Button variant="contained" onClick={handleAccountCreation}>
        <AddIcon fontSize="small" />
        <p>Добавить банковский счет</p>
      </Button>
      <Button variant="contained" onClick={handleCashBoxCreation}>
        <AddIcon fontSize="small" />
        <p>Добавить наличные или кассу</p>
      </Button>

      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleActionClick(e, false)}
      >
        {creationType === "account" ? (
          <AccountCreator setDrawerState={setDrawerState} />
        ) : (
          <CashboxCreator setDrawerState={setDrawerState} />
        )}
      </Drawer>
    </div>
  );
};

export default Actions;
