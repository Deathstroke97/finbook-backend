import React, { useContext } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import { useParams } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";

import { SessionContext } from "../../../context/SessionContext";

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
    height: "83%",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    "& > div": {
      display: "flex",
      alignItems: "center",
      marginLeft: "10px",
      fontSize: 11,
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
    fontSize: 24,
    fontWeight: theme.typography.fontWeightMedium,
    // marginBottom: 14,
    "&  span": {
      fontSize: 22,
    },
  },
  plan: {
    marginBottom: 5,
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
    width: (props) =>
      props.revenue
        ? `${props.data && props.data.totalIncome.percent}%`
        : props.expense
        ? `${props.data && props.data.totalOutcome.percent}%`
        : props.balance
        ? `${props.data && props.data.totalBalance.percent}%`
        : `${props.data && props.data.profitability.percent}%`,
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

  const getAmount = (amount, currency, type) => {
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
    let result = null;
    if (type === "fact") {
      result = (
        <p className={classes.fact}>
          {amount.toLocaleString()}
          &nbsp;
          {props.profitability && " %"}
          {!props.profitability && currencyPart}
          {/* <span>{props.profitability ? " %" : ` ${currencyPart}`}</span> */}
        </p>
      );
    }
    if (type === "plan") {
      result = (
        <p className={classes.plan}>
          {`План: ${amount.toLocaleString()}`}
          &nbsp;
          {props.profitability && "%"}
          {!props.profitability && currencyPart}
        </p>
      );
    }
    return <>{result}</>;
  };

  const { projectId } = useParams();

  let spinner = (
    <div className={classes.loaderContainer}>
      <CircularProgress />
    </div>
  );

  if (!props.loading && props.data) {
    const {
      totalIncome,
      totalOutcome,
      totalBalance,
      profitability,
    } = props.data;
    const cardName = props.cardName;
    const { percent, fact, plan } = props.revenue
      ? totalIncome
      : props.expense
      ? totalOutcome
      : props.balance
      ? totalBalance
      : profitability;

    // spinner = (
    //   <div className={classes.root}>
    //     <div className={classes.card}>
    //       <div className={classes.cardHeader}>
    //         <p className={classes.cardName}>{cardName}</p>
    //         {/* {projectId ? null : (
    //           <div>
    //             <ArrowDropUpIcon />
    //             <p className={classes.percent}>{percent}</p>
    //           </div>
    //         )} */}
    //       </div>
    //       <p className={classes.fact}>
    //         {fact.toFixed(2)}
    //         <span>{props.profitability ? " %" : ` ${businessCurrency}`}</span>
    //       </p>
    //       {projectId && (
    //         <p className={classes.plan}>
    //           {`План: ${plan.toFixed(2)}`}
    //           {props.profitability ? " %" : ` ${businessCurrency}`}
    //         </p>
    //       )}
    //     </div>
    //     <div className={classes.bar}>
    //       <div className={classes.barFill}></div>
    //     </div>
    //   </div>
    // );
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
          {getAmount(fact, businessCurrency, "fact")}
          {getAmount(plan, businessCurrency, "plan")}
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
