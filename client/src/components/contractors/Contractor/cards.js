import React from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core";
import Card from "./card";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flex: 1,
    marginTop: 15,
    "& > div": {
      width: "calc(1/4*100% - (1 - 1/4)*12px)",
      borderRadius: theme.shape.borderRadius,
      height: 140,
      marginRight: 14,
    },
  },
}));

const Cards = (props) => {
  const classes = useStyles();
  const { loading, overallNumbers, balance } = props;
  const { totalIncome, totalOutcome } = overallNumbers;

  return (
    <div className={classes.root}>
      <Card balance value={balance} loading={loading} />
      <Card income value={totalIncome} loading={loading} />
      <Card outcome value={totalOutcome} loading={loading} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.contractors.loading,
    overallNumbers: state.contractors.contractor.overallNumbers,
    balance: state.contractors.contractor.balance,
  };
};

export default connect(mapStateToProps, null)(Cards);
