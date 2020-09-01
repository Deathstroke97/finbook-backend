import React from "react";
import { makeStyles } from "@material-ui/core";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import Line from "./Line";
import Pie from "./Pie";
import Bar from "./Bar";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flex: 1,
    height: "28rem",
    justifyContent: "space-between",
    "& > div": {
      marginBottom: 14,
    },
  },
}));

const Graphs = (props) => {
  const classes = useStyles();
  const { projectId } = useParams();

  const transactions = projectId
    ? props.projectTransactions
    : props.transactions;

  return (
    <div className={classes.root}>
      {projectId ? (
        <Bar transactions={transactions} />
      ) : (
        <Line transactions={transactions} />
      )}
      <Pie transactions={transactions} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    transactions: state.transactions.transactions.transactions,
    projectTransactions: state.projects.project.transactions,
  };
};

export default connect(mapStateToProps, null)(Graphs);
