import React, { useContext } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import { useParams } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";

import { SessionContext } from "context/SessionContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    background: theme.palette.background.paper,
    // border: "1px solid rgba(0,0,0,0.1)",
    // boxShadow: theme.shadows[1],
    fontFamily: '"PT Sans",Tahoma,sans-serif',
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: "18px",
    paddingBottom: 5,
    height: "79%",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    "& > div": {
      display: "flex",
      alignItems: "center",
      marginLeft: "10px",
      fontSize: 12,
      "& svg": {
        color: (props) =>
          props.revenue
            ? theme.palette.success.main
            : props.expense
            ? theme.palette.error.main
            : theme.palette.primary.main,
      },
    },
  },
  cardName: {
    textTransform: "uppercase",
    fontSize: "11px",
    fontWeight: theme.typography.fontWeightBold,
  },
  percent: {
    marginLeft: -3,
    color: (props) =>
      props.revenue
        ? theme.palette.success.main
        : props.expense
        ? theme.palette.error.main
        : theme.palette.primary.main,
  },
  fact: {
    //fontSize: 20
    fontSize: 22,
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: 9,
    "& > span": {
      fontSize: 22,
    },
  },
  plan: {
    marginBottom: 14,
    fontWeight: theme.typography.fontWeightMedium,
    color: "rgb(0, 0, 0, 0.7)",
    fontSize: 12,
  },
  bar: {
    position: "relative",
    height: 5,
    width: "100%",
    backgroundColor: theme.palette.grey["100"],
  },
  barFill: {
    position: "absolute",
    width: "100%",
    height: 5,
    backgroundColor: (props) =>
      props.revenue
        ? theme.palette.success.main
        : props.expense
        ? theme.palette.error.main
        : theme.palette.primary.main,
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: theme.palette.background.paper,
  },
}));

const Card = (props) => {
  const classes = useStyles(props);
  const {
    user: { business },
  } = useContext(SessionContext);
  const businessCurrency = business.currency;

  const { projectId } = useParams();

  const getAmount = (amount, currency) => {
    let amountValue = parseFloat(amount).toLocaleString();
    let currencyPart;
    switch (currency) {
      case "USD":
        currencyPart = <span>&#36;</span>;
        break;
      case "RUB":
        currencyPart = <span>&#8381;</span>;
        break;
      case "KZT":
        currencyPart = <span>&#8376;</span>;
        break;
      default:
        currencyPart = <span></span>;
    }
    return (
      <Typography className={classes.fact}>
        {amountValue}
        {` `}
        {currencyPart}
      </Typography>
    );
  };

  let spinner = (
    <div className={classes.loaderContainer}>
      <CircularProgress />
    </div>
  );
  console.log("data: ", props.data);
  if (!props.loading && props.data) {
    const { totalIncome, totalOutcome, totalBalance } = props.data;
    const cardName = props.cardName;
    const { percent, fact, plan } = props.revenue
      ? totalIncome
      : props.expense
      ? totalOutcome
      : totalBalance;
    spinner = (
      <div className={classes.root}>
        <div className={classes.card}>
          <div className={classes.cardHeader}>
            <p className={classes.cardName}>{cardName}</p>
            {/* {projectId ? null : (
              <div>
                <ArrowDropUpIcon />
                <p className={classes.percent}>{percent}</p>
              </div>
            )} */}
          </div>
          {/* <p className={classes.fact}>
            {fact.toFixed(2)}
            <span>
              {"  "}
              {businessCurrency}
            </span>
          </p> */}
          {getAmount(fact, businessCurrency)}
          {/* <p className={classes.plan}>{plan.toFixed(2)}</p> */}
        </div>
        <div className={classes.bar}>
          <div className={classes.barFill}></div>
        </div>
      </div>
    );
  }

  return <>{spinner}</>;
};

export default Card;
