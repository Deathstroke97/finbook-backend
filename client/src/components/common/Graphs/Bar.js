import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { makeStyles } from "@material-ui/core";
import { fetchProject } from "store/actions";
import axios from "axios-instance";
import constants from "constants/constants";
import { connect } from "react-redux";
import moment from "moment";

const template = {
  labels: ["January", "February", "March", "April"],
  datasets: [
    {
      label: "Расход",
      backgroundColor: "rgb(185, 30, 30)",
      borderColor: "rgb(185, 30, 30)",
      borderWidth: 1,
      hoverBackgroundColor: "rgb(185, 30, 30)",
      hoverBorderColor: "rgb(185, 30, 30)",
      data: [0, 0, 55, 40],
    },
    {
      label: "Приход",
      backgroundColor: "rgb(13, 147, 91)",
      borderColor: "rgb(13, 147, 91)",
      borderWidth: 1,
      hoverBackgroundColor: "rgb(13, 147, 91)",
      hoverBorderColor: "rgb(13, 147, 91)",
      data: [25, 19, 0, 50],
    },
  ],
};

const options = {
  maintainAspectRatio: false,
  // legend: {
  //   display: false
  // },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
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
    text: "Динамика движения денежных средств",
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
  },
}));

const BarGraph = (props) => {
  const classes = useStyles();
  const { projectId } = useParams();
  const { filters } = props;
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const prepareDataForChart = (projects) => {
    const project = projects.find((project) => project._id === projectId);

    if (!project) {
      setData(null);
      return;
    }
    const { incomes, outcomes } = project.report;
    const labels = [];
    incomes.details.forEach((detail) => {
      labels.push(`${moment.months(detail.month)} ${detail.year}`);
    });

    const updatedData = {
      labels: labels,
      datasets: [
        {
          ...template.datasets[0],
          data: outcomes.details.map((detail) => detail.totalAmount),
        },
        {
          ...template.datasets[1],
          data: incomes.details.map((detail) => detail.totalAmount),
        },
      ],
    };
    setData(updatedData);
  };

  useEffect(() => {
    const fetchReportByProject = async () => {
      try {
        const report = await axios.post("/report/cashflow", {
          reportBy: constants.PROJECT,
          queryData: {
            createTime: {
              $gte: filters.startTime,
              $lte: filters.endTime,
            },
          },
          countPlanned: false,
        });
        prepareDataForChart(report.data.result.projects);
      } catch (err) {
        setError(err);
      }
    };

    fetchReportByProject();
  }, [props.transactions, props.filters]);

  return (
    <div className={classes.root}>
      {data && <Bar data={data} options={options} />}
    </div>
  );
};

const mapStateToPropes = (state) => {
  return {
    filters: state.projects.project.filters,
  };
};

export default connect(mapStateToPropes, null)(BarGraph);
