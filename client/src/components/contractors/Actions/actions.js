import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import Project from "../../common/create/project";
import ContractorCreator from "../../common/create/contractor";
import Drawer from "@material-ui/core/Drawer";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginTop: 14,
  },
}));

const Actions = (props) => {
  const classes = useStyles();
  const [drawerIsOpen, setDrawerState] = useState(false);

  const handleActionClick = (event, open) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerState(open);
  };

  const handleContractorAddition = () => {
    setDrawerState(true);
  };
  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleContractorAddition}
      >
        Добавить контрагента
      </Button>

      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleActionClick(e, false)}
      >
        <ContractorCreator
          setDrawerState={setDrawerState}
          contractorsFilters={props.contractorsFilters}
        />
      </Drawer>
    </div>
  );
};

export default Actions;
