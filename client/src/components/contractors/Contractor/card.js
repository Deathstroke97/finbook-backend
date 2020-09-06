import React, { useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { makeStyles, Typography } from "@material-ui/core";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import { useParams } from "react-router-dom";
import { splitByThree, getAmountWithoutSign } from "utils/functions";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    background: theme.palette.background.paper,
    // border: "1px solid rgba(0,0,0,0.1)",
    boxShadow: theme.shadows[1],
    fontFamily: '"PT Sans",Tahoma,sans-serif',
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: "18px",
    height: "83%",
  },

  cardHeaderText: {
    textTransform: "uppercase",
    fontSize: "11px",
    fontWeight: theme.typography.fontWeightBold,
  },

  cardValue: {
    fontSize: 22,
    fontWeight: theme.typography.fontWeightMedium,
    // marginBottom: 14
    "& > span": {
      fontSize: 22,
    },
  },
  fromPlanned: {
    // marginBottom: 14,
    fontWeight: theme.typography.fontWeightMedium,
    color: "rgb(0, 0, 0, 0.7)",
    fontSize: 13,
    position: "absolute",
    left: "18px",
    bottom: "-8px",
  },
  bottomElement: {
    position: "relative",
  },
  bar: {
    height: 5,
    width: "100%",
    backgroundColor: theme.palette.grey["100"],
  },
  barFill: {
    position: "absolute",
    width: "100%",
    height: 5,
    backgroundColor: (props) =>
      props.income ? theme.palette.success.main : theme.palette.error.main,
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

  const { balance, income, outcome, loading, data } = props;

  const getHeaderText = () => {
    let header = "";
    if (balance) header = "Баланс контрагента";
    if (income) header = "Перевел нам";
    if (outcome) header = "Мы перевели";
    return header;
  };

  const getBottomPart = () => {
    const { value } = props;
    let text = "";
    let result = null;
    if (balance) {
      if (value > 0) {
        text = "Контрагент должен нам";
        result = <p className={classes.fromPlanned}>{text}</p>;
      }
      if (value < 0) {
        text = "Мы должны контрагенту";
        result = <p className={classes.fromPlanned}>{text}</p>;
      }
    } else {
      result = (
        <div className={classes.bar}>
          <div className={classes.barFill}></div>
        </div>
      );
    }
    return result;
  };

  const getAmount = (amount, currency) => {
    let amountValue = parseFloat(amount).toLocaleString();
    if (props.balance && +amount < 0) {
      amountValue = parseFloat(amount) * -1;
      amountValue = amountValue.toLocaleString();
    }
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
      <Typography className={classes.cardValue}>
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
  console.log("loading in card: ", loading);
  if (!loading) {
    let amount = props.value;

    spinner = (
      <div className={classes.root}>
        <div className={classes.card}>
          <p className={classes.cardHeaderText}>{getHeaderText()}</p>
          {/* <p className={classes.cardValue}>
            {parseFloat(amount).toFixed(2)}
            <span>{` ${businessCurrency}`}</span>
          </p> */}
          {getAmount(amount, businessCurrency)}
        </div>
        <div className={classes.bottomElement}>{getBottomPart()}</div>
      </div>
    );
  }
  return <>{spinner}</>;
};

export default Card;
