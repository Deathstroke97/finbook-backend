import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";
import clsx from "clsx";

import { SessionContext } from "../../../context/SessionContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    background: theme.palette.background.paper,
    // boxShadow: theme.shadows[1],
    fontFamily: '"PT Sans",Tahoma,sans-serif',
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px",
    paddingBottom: 5,
    height: "50%",
  },
  cardBottom: {
    height: "50%",
    padding: "10px 18px",
    paddingBottom: 0,
  },
  cardHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  cardName: {
    textTransform: "uppercase",
    fontSize: "11px",
    fontWeight: theme.typography.fontWeightBold,
  },

  value: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: theme.typography.fontWeightMedium,
    "&  span": {
      fontSize: 22,
    },
  },
  detailedInfo: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeightMedium,
    color: "rgb(0, 0, 0, 0.7)",
  },
  bar: {
    position: "relative",
    height: 5,
    width: "100%",
    backgroundColor: theme.palette.grey["100"],
  },
  barFill: {
    position: "absolute",
    width: "67%",
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

const MainCard = (props) => {
  const classes = useStyles(props);
  const { loading, moneyInBusiness } = props;
  const {
    user: { business },
  } = useContext(SessionContext);
  const businessCurrency = business.currency;
  let currencyPart;

  const getCurrency = (currency) => {
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
    return currencyPart;
  };

  let spinner = (
    <div className={classes.loaderContainer}>
      <CircularProgress />
    </div>
  );
  if (!loading && moneyInBusiness) {
    const { total, accounts } = moneyInBusiness;

    spinner = (
      <div className={classes.root}>
        <div className={classes.card}>
          <div className={classes.cardHeader}>
            <p className={classes.cardName}>Деньги бизнесa</p>
            <p className={classes.value}>
              {parseFloat(total).toLocaleString()}{" "}
              {getCurrency(businessCurrency)}
            </p>
          </div>
        </div>
        <div className={classes.cardBottom}>
          {accounts.map((account, index, accounts) => {
            if (index < 3) {
              return (
                <p className={classes.detailedInfo} key={index}>
                  {parseFloat(account.balance).toLocaleString()}{" "}
                  {getCurrency(account.currency)} на счету {` ${account.name}`}
                </p>
              );
            }
          })}
        </div>
      </div>
    );
  }

  return <>{spinner}</>;
};

export default MainCard;
