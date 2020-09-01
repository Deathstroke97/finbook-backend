import React from "react";
import { makeStyles } from "@material-ui/core";
import Table from "./Table/table";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  }
}));

const Users = props => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Table />
    </div>
  );
};

export default Users;
