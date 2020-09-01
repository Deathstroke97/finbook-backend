import React from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import MoneyInBusinessCard from "./moneyInBusiness";

// import ProfitabilityCard from "./profitability";
import Card from "./card";

const cards = {
  revenue: {
    cardName: "Выручка",
    percent: "13 %",
    value: "111 202,45 P",
    fromPlanned: "67.1% от плановой выручки",
  },
  expense: {
    cardName: "Расходы",
    percent: "44.6 %",
    value: "331 890,00 P",
    fromPlanned: "50.2% от плановых расходов",
  },
  balance: {
    cardName: "Сальдо",
    percent: "112.6 %",
    value: "192 612,45 P",
    fromPlanned: "864.5% от планового сальдо",
  },
  profitability: {
    cardName: "Рентабельность",
    percent: "",
    value: "84.6 %",
    fromPlanned: "369.5% от плановой рентабельности",
  },
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flex: 1,
    marginTop: 15,
    justifyContent: "space-between",
    "& > div": {
      width: "calc(1/4*100% - (1 - 1/4)*12px)",
      borderRadius: theme.shape.borderRadius,
      height: 140,
    },
  },
}));

const Cards = (props) => {
  const classes = useStyles();
  const { projectId } = useParams();
  const data = projectId
    ? props.projectOverallNumbers
    : props.transactionOverallNumbers;
  const loading = projectId ? props.projectIsLoading : props.loading;

  return (
    <div className={classes.root}>
      <Card revenue cardName={"Выручка"} data={data} loading={loading} />
      <Card expense cardName={"Расходы"} data={data} loading={loading} />
      <Card balance cardName={"Сальдо"} data={data} loading={loading} />
      {projectId ? (
        <Card
          balance
          cardName={"Рентабельность"}
          data={data}
          loading={loading}
        />
      ) : (
        <MoneyInBusinessCard
          loading={loading}
          moneyInBusiness={props.moneyInBusiness}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.transactions.loading,
    projectIsLoading: state.projects.loading,
    transactionOverallNumbers: state.transactions.transactions.overallNumbers,
    projectOverallNumbers: state.projects.project.overallNumbers,
    initialLoading: state.transactions.initialLoading,
    moneyInBusiness: state.transactions.transactions.moneyInBusiness,
  };
};

export default connect(mapStateToProps, null)(Cards);
