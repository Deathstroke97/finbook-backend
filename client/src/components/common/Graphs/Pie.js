import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { Pie } from "react-chartjs-2";
import { SessionContext } from "context/SessionContext";
import constants from "constants/constants";
import { getConversionRates } from "./utils";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";
// import pieImage from "/";

const template = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(94,56, 201)",
        "rgb(254, 211, 55)",
        "rgb(204, 39,38)",
        "rgb(45, 55, 65)",
        "rgb(210, 80, 198)",
        "rgb(79, 61, 255)",
        "rgb(97, 214, 240)",
        "rgb(173, 173, 173)",
        "rgb(30,161,102)",
        "#007bff",
      ],
      // hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
    },
  ],
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "31%",
    background: theme.palette.background.paper,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    borderRadius: theme.shape.borderRadius,
    padding: 40,
    "& > div": {
      width: "100%",
      height: "100%",
    },
  },
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,

  legend: false,
  title: {
    display: true,
    position: "top",
    fontStyle: "bold",
    text: "Cтруктура расходов",
    fontSize: 14,
    fontColor: "rgb(44, 44, 44)",
    fontFamily: '"PT Sans", Tahoma, sans-serif',
  },
  tooltips: {
    enabled: true,
    callbacks: {
      label: function (tooltipItem, data) {
        console.log("tooltipItem: ", tooltipItem);
        console.log("data: ", data);
        let label = data.labels[tooltipItem.index];

        if (label) {
          label += ": ";
        }
        const percentage = data.datasets[0].data[tooltipItem.index];
        label += percentage;
        label += " %";
        return label;
      },
    },
  },
};
const PieGraph = (props) => {
  const classes = useStyles();
  const [data, setData] = useState(null);
  const {
    user: { businessCurrency },
  } = useContext(SessionContext);
  const accounts = props.accounts;

  const getOutcomeTransactions = (transactions) => {
    if (!transactions) return [];
    if (transactions) {
      return transactions.filter((transaction) => {
        return (
          transaction.type === constants.OPERATION_OUTCOME &&
          transaction.isPlanned === false
        );
      });
    }
  };

  const prepareDataForChart = async (transactions) => {
    const conversionRates = await getConversionRates(
      accounts,
      businessCurrency
    );
    const outcomeTransactions = getOutcomeTransactions(transactions);
    console.log("outcomeTransactions: ", outcomeTransactions);
    let categories = {};
    let totalOutcome = 0;
    categories["Cтатья не указана"] = 0;
    for (const transaction of outcomeTransactions) {
      const converted =
        conversionRates[transaction.account._id] * +transaction.amount;
      totalOutcome += converted;
      const category = transaction.category;
      if (category === null) {
        categories["Cтатья не указана"] += converted;
      } else if (!categories.hasOwnProperty(category.name)) {
        categories[category.name] = converted;
      } else {
        categories[category.name] = categories[category.name] + converted;
      }
    }
    const updatedData = {
      labels: Object.keys(categories),
      datasets: [
        {
          ...template.datasets[0],
          data: Object.keys(categories).map((label) =>
            ((categories[label] * 100) / totalOutcome).toFixed(2)
          ),
        },
      ],
    };
    setData(updatedData);
  };

  useEffect(() => {
    if (props.transactions) {
      console.log("in pie: ", props.transactions);
      prepareDataForChart(props.transactions);
    }
  }, [props.transactions]);

  let spinner = (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  );

  const outcomeTransactions = getOutcomeTransactions(props.transactions);
  if (outcomeTransactions.length === 0) {
    spinner = (
      <div className={classes.root}>
        <img
          src="/images/pie.png"
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  if (props.transactions && data && outcomeTransactions.length > 0) {
    spinner = (
      <div className={classes.root}>
        <Pie data={data} width={100} height={100} options={options} />
      </div>
    );
  }

  return <>{spinner}</>;
};

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts.accounts,
  };
};

export default connect(mapStateToProps, null)(PieGraph);
