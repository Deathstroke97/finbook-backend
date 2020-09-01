import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { Line } from "react-chartjs-2";
import { SessionContext } from "context/SessionContext";
import { updateObject } from "utils/functions";
import moment from "moment";
import axios from "axios";
import {
  filterTransactions,
  getBalanceForDate,
  getFactTransactionForGivenDate,
  attachTransactionsForAccounts,
  getConversionRates,
} from "./utils";
import { connect } from "react-redux";

const template = {
  labels: [],
  datasets: [
    {
      label: "Состояние счета",
      fill: false,
      lineTension: 0,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderColor: "#007bff",
      borderCapStyle: "butt",
      borderDash: [5, 5],
      borderWidth: 2,
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "#007bff",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "#007bff",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 10,
      data: [],
      //all transactions fact and planned
    },
    {
      label: "",
      fill: true,
      lineTension: 0,
      backgroundColor: "rgb(231,244,253)",
      borderColor: "#007bff",
      borderCapStyle: "square",
      borderWidth: 2,
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "#007bff",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "#007bff",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 10,
      data: [],
      //only fact
    },
  ],
};

const options = {
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          unit: "day",
          unitStepSize: 1,
          displayFormats: {
            day: "MMM DD",
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 15,
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
  tooltips: {
    callbacks: {
      label: function (tooltipItem, data) {
        if (data.datasets[tooltipItem.datasetIndex].label === "") return;
        var label = "Состояние счета";

        if (label) {
          label += ": ";
        }
        label += parseFloat(tooltipItem.yLabel).toFixed(2);
        const businessCurrency = localStorage.getItem("businessCurrency");
        console.log("businessCurrency: ", businessCurrency);
        if (businessCurrency === "RUB") label += " рублей";
        if (businessCurrency === "USD") label += " долларов";
        if (businessCurrency === "KZT") label += " тенге";
        return label;
      },
    },
  },
  elements: {
    line: {
      fill: false,
      tension: 0,
    },
  },
  title: {
    display: true,
    position: "top",
    fontStyle: "bold",
    text: "Деньги бизнеса",
    fontSize: 14,
    fontColor: "rgb(44, 44, 44)",
    fontFamily: '"PT Sans", Tahoma, sans-serif',
  },
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "67%",
    background: theme.palette.background.paper,
    alignItems: "stretch",
    marginTop: 14,
    borderRadius: theme.shape.borderRadius,
    padding: 15,
    // boxShadow: theme.shadows[1],
  },
}));

const LineGraph = (props) => {
  const classes = useStyles();
  const [data, setData] = useState(null);
  const {
    user: { businessCurrency },
  } = useContext(SessionContext);

  const prepareDataForChart = async (transactions) => {
    const transactionsByDate = {};
    const accounts = attachTransactionsForAccounts(
      props.accounts,
      transactions
    );

    const conversionRates = await getConversionRates(
      accounts,
      businessCurrency
    );

    for (let i = 0; i < transactions.length; i++) {
      const date1 = moment(transactions[i].date).format("YYYY-MM-DD");
      transactionsByDate[date1] = [];
      for (let j = 0; j < transactions.length; j++) {
        const date2 = moment(transactions[j].date).format("YYYY-MM-DD");
        if (moment(date1).isSame(date2) || moment(date1) > moment(date2)) {
          transactionsByDate[date1].push(transactions[j]);
        }
        if (moment(date2) > moment(date1)) {
          break;
        }
      }
    }

    let labels = [];
    let allTransactions = [];
    let factTransactions = [];

    const dates = Object.keys(transactionsByDate);
    for (let i = 0; i < dates.length; i++) {
      labels.push(dates[i]);
      const hasFactTransactionForThisDate = getFactTransactionForGivenDate(
        dates[i],
        transactionsByDate[dates[i]]
      );
      const filteredTransactions = filterTransactions(
        hasFactTransactionForThisDate,
        transactionsByDate[dates[i]]
      );

      const balanceForDate = await getBalanceForDate(
        dates[i],
        conversionRates,
        accounts,
        props.accountInFilter,
        filteredTransactions
      );
      allTransactions.push(balanceForDate);
      if (hasFactTransactionForThisDate) {
        factTransactions.push(balanceForDate);
      }
    }
    let startIndex, endIndex;
    for (let i = 0; i < factTransactions.length; i++) {
      if (factTransactions[i] !== allTransactions[i]) {
        startIndex = i;
        for (let j = i; j < allTransactions.length; j++) {
          if (factTransactions[i] === allTransactions[j]) {
            endIndex = j;
            for (let k = startIndex; k < endIndex; k++) {
              delete allTransactions[k];
              delete labels[k];
            }
            allTransactions = allTransactions.filter((tr) => tr !== undefined);
            labels = labels.filter((label) => label !== undefined);
            break;
          }
        }
      }
    }

    const updatedData = {
      labels: labels,
      datasets: [
        {
          ...template.datasets[0],
          data: allTransactions,
        },
        {
          ...template.datasets[1],
          data: factTransactions,
        },
      ],
    };
    setData(updatedData);
  };

  useEffect(() => {
    if (props.transactions) {
      const reversed = props.transactions.slice().reverse();
      prepareDataForChart(reversed);
    }
  }, [props.transactions]);

  console.log("data for graph: ", data);
  // console.log("window.conversion_rates: ", window.conversion_rates);
  return (
    <div className={classes.root}>
      {" "}
      {props.transactions && <Line data={data} options={options} />}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts.accounts,
    accountInFilter: state.transactions.filters.account,
  };
};

export default connect(mapStateToProps, null)(LineGraph);
