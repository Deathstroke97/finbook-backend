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
    filters: { reportBy },
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
      <Typography className={clsx(genCellStyle(amount, type))}>
        {amountValue}
        {` `}
        {currencyPart}
      </Typography>
    );
  };

  const genCellStyle = (value, type) => {
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

  const generateRows = (
    { total, details },
    name,
    main,
    type,
    lastSubRow,
    projectRow
  ) => {
    return (
      <TableRow
        className={clsx(
          main ? classes.boldRow : classes.subRow,
          lastSubRow && classes.lastSubRow,
          projectRow && classes.projectRow
        )}
      >
        <TableCell component="td">{name}</TableCell>
        {details.map((detail) => {
          return (
            <TableCell align="right">
              {getAmount(detail.totalAmount, businessCurrency, type)}
            </TableCell>
          );
        })}
        <TableCell align="right">
          {getAmount(total, businessCurrency, type)}
        </TableCell>
      </TableRow>
    );
  };

  const generateInnerRows = (categories, type, reportBy) => {
    const categoriesBody =
      categories &&
      categories.map(({ name, periods }, index, array) => {
        if (!name) {
          if (reportBy === constants.CATEGORY) {
            name = "Статья не указана";
          }
          if (reportBy === constants.CONTRACTOR) {
            name = "Контрагент не указан";
          }
        }
        let lastSubRow = index === array.length - 1;
        return generateRows(periods, name, false, type, lastSubRow);
      });
    return categoriesBody;
  };

  const generateProjectRow = (report, name, main) => {
    const { incomes, outcomes, balance } = report;
    return (
      <>
        {generateRows(balance, name, main, constants.BALANCE, false, true)}
        {generateRows(incomes, "Поступления", true, constants.INCOME)}
        {generateInnerRows(
          incomes.categories,
          constants.INCOME,
          constants.CATEGORY
        )}
        {generateRows(outcomes, "Выплаты", true, constants.OUTCOME)}
        {generateInnerRows(
          outcomes.categories,
          constants.OUTCOME,
          constants.CATEGORY
        )}
      </>
    );
  };

  const generateProjectsRows = (projects) => {
    const projectsBody = projects.map(({ name, report }) => {
      if (!name) {
        name = "Проект не указан";
      }
      return generateProjectRow(report, name, true);
    });
    return projectsBody;
  };

  let tableBody = <TableBody></TableBody>;

  if (report && reportBy === constants.CATEGORY) {
    const {
      moneyInTheBeginning,
      incomes,
      outcomes,
      balance,
      moneyInTheEnd,
    } = report;
    if (
      moneyInTheBeginning &&
      incomes &&
      outcomes &&
      balance &&
      moneyInTheBeginning
    ) {
      tableBody = (
        <TableBody>
          {generateRows(moneyInTheBeginning, "Денег в начале", true)}
          {generateRows(incomes, "Поступления", true, constants.INCOME)}
          {generateInnerRows(
            incomes.categories,
            constants.INCOME,
            constants.CATEGORY
          )}
          {generateRows(outcomes, "Выплаты", true, constants.OUTCOME)}
          {generateInnerRows(
            outcomes.categories,
            constants.OUTCOME,
            constants.CATEGORY
          )}
          {generateRows(balance, "Сальдо", true, constants.BALANCE)}
          {generateRows(moneyInTheEnd, "Денег в конце", true)}
        </TableBody>
      );
    }
  }

  if (report && reportBy === constants.ACTIVITY) {
    const {
      moneyInTheBeginning,
      financial,
      investment,
      operational,
      moneyInTheEnd,
    } = report;
    if (
      moneyInTheBeginning &&
      financial &&
      investment &&
      operational &&
      moneyInTheEnd
    ) {
      tableBody = (
        <TableBody>
          {generateRows(moneyInTheBeginning, "Денег в начале", true)}
          {/* operational */}
          {generateRows(
            operational.report.balance,
            "ОПЕРАЦИОННАЯ",
            true,
            constants.BALANCE
          )}
          {generateRows(
            operational.report.incomes,
            "Поступления",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            operational.report.incomes.categories,
            constants.INCOME,
            constants.CATEGORY
          )}
          {generateRows(
            operational.report.outcomes,
            "Выплаты",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            operational.report.outcomes.categories,
            constants.OUTCOME,
            constants.CATEGORY
          )}
          {/* investment */}
          {generateRows(
            investment.report.balance,
            "ИНВЕСТИЦИОННАЯ",
            true,
            constants.BALANCE
          )}
          {generateRows(
            investment.report.incomes,
            "Поступления",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            investment.report.incomes.categories,
            constants.INCOME,
            constants.CATEGORY
          )}
          {generateRows(
            investment.report.outcomes,
            "Выплаты",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            investment.report.outcomes.categories,
            constants.OUTCOME,
            constants.CATEGORY
          )}
          {/* financial */}
          {generateRows(
            financial.report.balance,
            "ФИНАНСОВАЯ",
            true,
            constants.BALANCE
          )}
          {generateRows(
            financial.report.incomes,
            "Поступления",
            true,
            constants.INCOME
          )}
          {generateInnerRows(
            financial.report.incomes.categories,
            constants.INCOME,
            constants.CATEGORY
          )}
          {generateRows(
            financial.report.outcomes,
            "Выплаты",
            true,
            constants.OUTCOME
          )}
          {generateInnerRows(
            financial.report.outcomes.categories,
            constants.OUTCOME,
            constants.CATEGORY
          )}
          {generateRows(moneyInTheEnd, "Денег в конце", true)}
        </TableBody>
      );
    }
  }

  if (report && reportBy === constants.ACCOUNT) {
    const {
      moneyInTheBeginning,
      incomes,
      outcomes,
      balance,
      moneyInTheEnd,
    } = report;
    if (
      moneyInTheBeginning &&
      incomes &&
      outcomes &&
      balance &&
      moneyInTheEnd
    ) {
      tableBody = (
        <TableBody>
          {generateRows(moneyInTheBeginning, "Денег в начале", true)}
          {generateRows(incomes, "Поступления", true, constants.INCOME)}
          {generateInnerRows(incomes.accounts, constants.INCOME)}
          {generateRows(outcomes, "Выплаты", true, constants.OUTCOME)}
          {generateInnerRows(outcomes.accounts, constants.OUTCOME)}
          {generateRows(balance, "Сальдо", true, constants.BALANCE)}
          {generateRows(moneyInTheEnd, "Денег в конце", true)}
        </TableBody>
      );
    }
  }

  if (report && reportBy === constants.CONTRACTOR) {
    const {
      moneyInTheBeginning,
      incomes,
      outcomes,
      balance,
      moneyInTheEnd,
    } = report;
    if (
      moneyInTheBeginning &&
      incomes &&
      outcomes &&
      balance &&
      moneyInTheEnd
    ) {
      tableBody = (
        <TableBody>
          {generateRows(moneyInTheBeginning, "Денег в начале", true)}
          {generateRows(incomes, "Поступления", true, constants.INCOME)}
          {generateInnerRows(
            incomes.contractors,
            constants.INCOME,
            constants.CONTRACTOR
          )}
          {generateRows(outcomes, "Выплаты", true, constants.OUTCOME)}
          {generateInnerRows(
            outcomes.contractors,
            constants.OUTCOME,
            constants.CONTRACTOR
          )}
          {generateRows(balance, "Сальдо", true, constants.BALANCE)}
          {generateRows(moneyInTheEnd, "Денег в конце", true)}
        </TableBody>
      );
    }
  }

  if (report && reportBy === constants.PROJECT) {
    const { moneyInTheBeginning, projects, balance, moneyInTheEnd } = report;
    if (moneyInTheBeginning && projects && balance && moneyInTheEnd) {
      tableBody = (
        <TableBody>
          {generateRows(moneyInTheBeginning, "Денег в начале", true)}
          {generateProjectsRows(projects)}
          {generateRows(balance, "Сальдо", true, constants.BALANCE)}
          {generateRows(moneyInTheEnd, "Денег в конце", true)}
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
              <TableCell className={classes.tableCellHead}>СТАТЬЯ</TableCell>
              {report &&
                report.moneyInTheBeginning.details.map((detail) => (
                  <TableCell className={classes.tableCellHead} align="right">
                    {`${moment.months(detail.month)} ${detail.year}`}
                  </TableCell>
                ))}
              <TableCell className={classes.tableCellHead} align="right">
                ИТОГО
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
