import React, { useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { Link, useRouteMatch } from "react-router-dom";
import { splitByThree } from "utils/functions";
import constants from "constants/constants";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import EnhancedTableHead from "./tableHead";
import EnhancedTableToolbar from "./tableToolbar";
import { Typography, Box } from "@material-ui/core";
import Project from "../Project/project";
import filters from "components/home/Filters/filters";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: 14,
    // boxShadow: theme.shadows[1]
  },
  paper: {
    width: "100%",
    // marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      // backgroundColor: theme.palette.background.default
    },
    "&:hover": {
      backgroundColor: "rgb(210, 235, 253) !important",
    },
    textDecoration: "none",
  },
  tableRowSelect: {
    backgroundColor: "transparent !important",
  },
  tableCell: {
    "& p": {
      // fontSize: 13.5
    },
  },
  headCell: {
    fontWeight: theme.typography.fontWeightBold,
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    fontSize: 13,
    "&:first-child": {
      paddingLeft: 30,
    },
  },
  incomeStyle: {
    color: theme.palette.success.main,
    // fontSize: 13.5
  },
  expenseStyle: {
    color: theme.palette.error.main,
    // fontSize: 13.5
  },
  yAlignCenter: {
    display: "flex",
    alignItems: "center",
  },
  transactionDateStyle: {
    fontSize: 14,
  },
  accrualDateStyle: {
    fontSize: 12,
  },
  grey: {
    color: theme.palette.grey[600],
  },
}));

const EnhancedTable = (props) => {
  const classes = useStyles();
  const {
    user: { business },
  } = useContext(SessionContext);
  const businessCurrency = business.currency;
  const { filters, projects, totalItems, loading, handleFiltersChange } = props;
  const [selected, setSelected] = useState([]);

  const page = filters.page;
  const rowsPerPage = filters.rowsPerPage;

  const match = useRouteMatch();

  const handleChangePage = (event, newPage) => {
    const updatedFilters = {
      ...props.filters,
      page: newPage,
    };
    handleFiltersChange(updatedFilters);
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);

    const updatedFilters = {
      ...props.filters,
      page: 0,
      rowsPerPage: rowsPerPage,
    };
    handleFiltersChange(updatedFilters);
  };

  // const getAmount = (amount, type) => {
  //   if (+amount === 0) amount = "0.00";
  //   amount = String(amount);
  //   let arr = amount.split(".");
  //   let integerPart = arr[0];
  //   let decimalPart = arr[1];
  //   let result = splitByThree(integerPart) + "." + decimalPart;
  //   return ` ${result}`;
  // };

  const getAmount = (amount, currency, type) => {
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
      <Typography className={genCellStyle(type)} variant="subtitle2">
        {amountValue}
        {` `}
        {currencyPart}
      </Typography>
    );
  };

  const genCellStyle = (type) => {
    return clsx(
      type === constants.OPERATION_INCOME && classes.incomeStyle,
      type === constants.OPERATION_OUTCOME && classes.expenseStyle
    );
  };

  const labelDisplayedRows = ({ from, to, count }) => {
    const first = to === -1 ? count : to;
    const second = count !== -1 ? count : "more than" + to;
    return `${from}-${first} из ${second}`;
  };

  const getGrossProfit = (project) => {
    return {
      fact: (project.factIncome - project.factOutcome).toFixed(2),
      plan: (project.planIncome - project.planOutcome).toFixed(2),
    };
  };

  const getProfitability = (grossProfit, project) => {
    let result = {};
    if (+project.factIncome === 0) {
      result.fact = 0;
    }
    if (+project.planIncome === 0) {
      result.plan = 0.0;
    }
    if (+project.factIncome !== 0) {
      result.fact = ((grossProfit.fact * 100) / +project.factIncome).toFixed(2);
    }
    if (+project.planIncome !== 0) {
      result.plan = ((grossProfit.plan * 100) / +project.planIncome).toFixed(2);
    }
    return result;
  };

  let tableBody = <TableBody></TableBody>;

  if (!loading) {
    if (projects && projects.length > 0) {
      tableBody = (
        <TableBody>
          {projects.map((project, index) => {
            const labelId = `enhanced-table-checkbox-${index}`;
            const grossProfit = getGrossProfit(project);
            const profitability = getProfitability(grossProfit, project);
            return (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={project._id}
                classes={{
                  root: classes.tableRow,
                  selected: classes.tableRowSelect,
                }}
                component={Link}
                to={`${match.url}/${project._id}`}
              >
                <TableCell
                  component="th"
                  id={labelId}
                  scope="row"
                  padding="none"
                  className={classes.tableCell}
                  style={{ paddingRight: 45, paddingLeft: 30 }}
                >
                  <Box flexDirection="column">
                    <Typography
                      variant="subtitle2"
                      className={classes.transactionDateStyle}
                    >
                      {project.name}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      className={classes.accrualDateStyle}
                    >
                      {project.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className={classes.tableCell}>
                  <Box flexDirection="column">
                    <Typography variant="subtitle2" className={classes.grey}>
                      Факт
                    </Typography>
                    <Typography variant="subtitle2" className={classes.grey}>
                      План
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box flexDirection="column">
                    {getAmount(
                      project.factIncome,
                      businessCurrency,
                      constants.OPERATION_INCOME
                    )}

                    {getAmount(
                      project.planIncome,
                      businessCurrency,
                      constants.OPERATION_INCOME
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box flexDirection="column">
                    {getAmount(
                      project.factOutcome,
                      businessCurrency,
                      constants.OPERATION_OUTCOME
                    )}

                    {getAmount(
                      project.planOutcome,
                      businessCurrency,
                      constants.OPERATION_OUTCOME
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box flexDirection="column">
                    {getAmount(
                      grossProfit.fact,
                      businessCurrency,
                      grossProfit.fact > 0
                        ? constants.OPERATION_INCOME
                        : grossProfit.fact < 0
                        ? constants.OPERATION_OUTCOME
                        : ""
                    )}

                    {getAmount(
                      grossProfit.plan,
                      businessCurrency,
                      grossProfit.plan > 0
                        ? constants.OPERATION_INCOME
                        : grossProfit.plan < 0
                        ? constants.OPERATION_OUTCOME
                        : ""
                    )}
                  </Box>
                </TableCell>
                <TableCell className={classes.tableCell}>
                  <Box flexDirection="column">
                    <Typography variant="subtitle2">
                      {parseFloat(profitability.fact).toFixed(2)} %
                    </Typography>
                    <Typography variant="subtitle2">
                      {parseFloat(profitability.plan).toFixed(2)} %
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      );
    } else {
      tableBody = (
        <TableBody>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell style={{ paddingLeft: 0 }}>Проекты не найдены</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      );
    }
  }

  console.log("selected: ", selected);
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            classdate={classes.table}
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead classes={classes} />
            {tableBody}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[3, 5, 10]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          labelRowsPerPage={"Количество проектов на странице"}
          labelDisplayedRows={labelDisplayedRows}
        />
      </Paper>
    </div>
  );
};

export default EnhancedTable;
