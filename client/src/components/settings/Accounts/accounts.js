import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";
import { SessionContext } from "context/SessionContext";
import axios from "axios-instance";
import * as actions from "store/actions";
import Actions from "./actions";
import Table from "./table";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const Accounts = (props) => {
  const classes = useStyles();
  const context = useContext(SessionContext);
  const { user } = useContext(SessionContext);
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/accounts")
      .then((res) => {
        setAccounts(res.data.accounts);
        setLoading(false);
      })
      .catch((err) => setError(err));
  }, []);

  return (
    <div className={classes.root}>
      <Actions />
      <Table accounts={accounts} loading={loading} />
    </div>
  );
};

export default Accounts;
