import React, { useContext, useState } from "react";
import { SessionContext } from "context/SessionContext";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Typography from "@material-ui/core/Typography";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import constants from "constants/constants";
import moment from "moment";
import { categories } from "dummyData";
import periods from "constants/periods";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginTop: 15,
    "& p": {
      fontSize: 14,
      whiteSpace: "nowrap",
      cursor: "pointer",
    },
  },
  table: {
    minWidth: 650,
    "& tr:hover": {
      // backgroundColor: "#f5f5f5",
      backgroundColor: "rgb(210, 235, 252)",
    },
    "& td:first-child": {
      borderRight: "1px solid rgb(224, 224, 224)",
      whiteSpace: "nowrap",
    },
    "& td:last-child": {
      paddingLeft: 30,
      borderLeft: "1px solid rgb(224, 224, 224)",
      whiteSpace: "nowrap",
    },
    "& td": {
      paddingTop: 10,
      paddingBottom: 10,
      cursor: "default",
    },
  },

  upperCase: {
    textTransform: "uppercase",
  },

  tableCellHead: {
    fontWeight: theme.typography.fontWeightBold,

    fontSize: 13,
    "&:first-child": {
      borderRight: "1px solid rgb(224, 224, 224)",
    },
    "&:last-child": {
      borderLeft: "1px solid rgb(224, 224, 224)",
    },
  },
  boldRow: {
    "& > td": {
      fontWeight: theme.typography.fontWeightBold,
    },
    "& p": {
      fontWeight: theme.typography.fontWeightBold,
    },
  },
  incomeStyle: {
    color: theme.palette.success.main,
  },
  outcomeStyle: {
    color: theme.palette.error.main,
  },

  subRow: {
    "& td": {
      border: "none",
    },
    "& > td:first-child": {
      paddingLeft: 30,
    },
  },
  lastSubRow: {
    "& td": {
      borderBottom: "1px solid rgb(224, 224, 224)",
    },
  },
  projectRow: {
    backgroundColor: "#f5f5f5",
  },
}));

const SimpleTable = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const {
    user: { business },
  } = useContext(SessionContext);
  const businessCurrency = business.currency;
  const {
    report,
    filters: { reportBy, method },
  } = props;

  const getAmount = (amount, currency, type) => {
    let amountValue = parseFloat(amount).toLocaleString();

    if (amount !== 0) {
      if (type === constants.OUTCOME) {
        amountValue = `—${amountValue}`;
      }
      if (type === constants.BALANCE) {
        if (amount < 0) {
          amountValue = `—${parseFloat(+amount * -1).toLocaleString()}`;
        }
      }
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
      <Typography className={clsx(getAmountStyle(amount, type))}>
        {amountValue}
        {` `}
        {currencyPart}
      </Typography>
    );
  };

  const getAmountStyle = (value, type) => {
    console.log("type: ", type);
    if (type === constants.BALANCE) {
      if (value > 0) {
        return clsx(classes.incomeStyle);
      }
      if (value < 0) {
        return clsx(classes.outcomeStyle);
      }
    }
    return clsx(
      type == constants.INCOME && value != 0 && classes.incomeStyle,
      type == constants.OUTCOME && value != 0 && classes.outcomeStyle
    );
  };

  const getAmountPercentage = (total) => {
    let amountValue = parseFloat(total).toFixed(2);

    if (total < 0) {
      amountValue = `—${(amountValue * -1).toFixed(2)} %`;
    } else {
      amountValue = `${amountValue} %`;
    }
    return (
      <Typography className={clsx(getAmountStyle(total, constants.BALANCE))}>
        {amountValue}
      </Typography>
    );
  };

  const generateRows = ({ total, details }, name, main, type, lastSubRow) => {
    return (
      <TableRow
        className={clsx(
          main ? classes.boldRow : classes.subRow,
          lastSubRow && classes.lastSubRow
        )}
      >
        <TableCell component="td">{name}</TableCell>
        {details.map((detail) => {
          return (
            <TableCell align="right">
              {name === "Операционная рентабельность"
                ? getAmountPercentage(detail.totalAmount)
                : getAmount(detail.totalAmount, businessCurrency, type)}
            </TableCell>
          );
        })}
        <TableCell align="right">
          {name === "Операционная рентабельность"
            ? getAmountPercentage(total)
            : getAmount(total, businessCurrency, type)}
        </TableCell>
      </TableRow>
    );
  };

  const generateInnerRows = (array, type, reportBy) => {
    const innerRowsBody = array.map((el, index, array) => {
      let name,
        periods = el.periods;
      if (reportBy === constants.CATEGORY) {
        name = el.categoryId && el.categoryId.name;
      }
      if (reportBy === constants.PROJECT) {
        name = el.projectId && el.projectId.name;
      }
      if (!name) {
        if (reportBy === constants.CATEGORY) {
          name = "Статья не указана";
        }
        if (reportBy === constants.PROJECT) {
          name = "Проект не указан";
        }
      }
      let lastSubRow = index === array.length - 1;
      return generateRows(periods, name, false, type, lastSubRow);
    });
    return innerRowsBody;
  };

  const generateSeparateCategoriesReport = (categories) => {
    const categoriesBody = categories.map(({ name, periods }) => {
      return generateRows(periods, name, true, constants.OUTCOME);
    });
    return categoriesBody;
  };

  let tableBody = <TableBody></TableBody>;

  if (report && reportBy === constants.CATEGORY) {
    const {
      incomes,
      outcomes,
      operatingProfit,
      operatingProfitability,
      separateCategoriesReport,
    } = report;
    if (
      incomes &&
      outcomes &&
      operatingProfit &&
      operatingProfitability &&
      separateCategoriesReport
    ) {
      tableBody = (
        <TableBody>
          {generateRows(
            incomes.withProjects,
            "Выручка по проектам",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            incomes.withProjects.categories,
            constants.INCOME,
            constants.CATEGORY
          )}
          {generateRows(
            incomes.withoutProjects,
            "Косвенная выручка",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            incomes.withoutProjects.categories,
            constants.INCOME,
            constants.CATEGORY
          )}
          {generateRows(
            outcomes.withProjects,
            "Расходы по проектам",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            outcomes.withProjects.categories,
            constants.OUTCOME,
            constants.CATEGORY
          )}
          {generateRows(
            outcomes.withoutProjects,
            "Косвенные расходы",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            outcomes.withoutProjects.categories,
            constants.OUTCOME,
            constants.CATEGORY
          )}
          {generateRows(
            operatingProfit,
            "Операционная прибыль (EBIT)",
            true,
            constants.BALANCE
          )}
          {generateRows(
            operatingProfitability,
            "Операционная рентабельность",
            true,
            constants.BALANCE
          )}
          {separateCategoriesReport.outcomes.categories.length > 0 &&
            generateSeparateCategoriesReport(
              separateCategoriesReport.outcomes.categories
            )}
        </TableBody>
      );
    }
  }

  if (report && reportBy === constants.PROJECT) {
    const {
      incomes,
      outcomes,
      operatingProfit,
      operatingProfitability,
      separateCategoriesReport,
    } = report;
    if (
      incomes &&
      outcomes &&
      operatingProfit &&
      operatingProfitability &&
      separateCategoriesReport
    ) {
      tableBody = (
        <TableBody>
          {generateRows(
            incomes.withProjects,
            "Выручка по проектам",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            incomes.withProjects.projects,
            constants.INCOME,
            constants.PROJECT
          )}
          {generateRows(
            incomes.withoutProjects,
            "Косвенная выручка",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            incomes.withoutProjects.projects,
            constants.INCOME,
            constants.PROJECT
          )}
          {generateRows(
            outcomes.withProjects,
            "Расходы по проектам",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            outcomes.withProjects.projects,
            constants.OUTCOME,
            constants.PROJECT
          )}
          {generateRows(
            outcomes.withoutProjects,
            "Косвенные расходы",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            outcomes.withoutProjects.projects,
            constants.OUTCOME,
            constants.PROJECT
          )}
          {generateRows(
            operatingProfit,
            "Операционная прибыль (EBIT)",
            true,
            constants.BALANCE
          )}
          {generateRows(
            operatingProfitability,
            "Операционная рентабельность",
            true,
            constants.BALANCE
          )}
          {separateCategoriesReport.outcomes.categories.length > 0 &&
            generateSeparateCategoriesReport(
              separateCategoriesReport.outcomes.categories
            )}
        </TableBody>
      );
    }
  }

  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                className={clsx(classes.tableCellHead, classes.upperCase)}
              >
                Показатель
              </TableCell>
              {report &&
                report.incomes.withProjects.details.map((detail) => (
                  <TableCell className={classes.tableCellHead} align="right">
                    {`${moment.months(detail.month)} ${detail.year}`}
                  </TableCell>
                ))}
              <TableCell
                className={clsx(classes.tableCellHead, classes.upperCase)}
                align="right"
              >
                Итого
              </TableCell>
            </TableRow>
          </TableHead>

          {tableBody}
        </Table>
      </TableContainer>
    </div>
  );
};

export default SimpleTable;
// &nbsp;
