import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { SessionContext } from "context/SessionContext";
import constants from "constants/constants";
import clsx from "clsx";
import { splitByThree, getAmountWithSign } from "utils/functions";

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
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";

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
      fontSize: 14,
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
    fontSize: 14,
  },
  expenseStyle: {
    color: theme.palette.error.main,
    fontSize: 14,
  },
  balanceStyle: {
    fontSize: 14,
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
  businessCurrency: {
    fontSize: 10,
  },
}));

const EnhancedTable = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const {
    filters,
    contractors,
    totalItems,
    loading,
    handleFiltersChange,
  } = props;
  const [selected, setSelected] = useState([]);
  const {
    user: { business },
  } = useContext(SessionContext);
  const businessCurrency = business.currency;

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
  //   let arr = amount.split(".");
  //   let integerPart = arr[0];
  //   let decimalPart = arr[1];
  //   let result = splitByThree(integerPart) + "." + decimalPart;
  //   return type === constants.OPERATION_INCOME ? `+${result}` : `${result}`;
  // };
  const getAmount = (amount, type) => {
    let amountValue = parseFloat(amount).toLocaleString();
    if (type && type === constants.OPERATION_INCOME) {
      amountValue = `+${amountValue}`;
    }
    if (type && type === constants.OPERATION_OUTCOME) {
      amountValue = `${amountValue}`;
    }

    let currencyPart;
    switch (businessCurrency) {
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

  const getAmountStyle = (amount, type) => {
    return clsx(
      type === constants.OPERATION_INCOME && classes.incomeStyle,
      type === constants.OPERATION_OUTCOME && classes.expenseStyle,
      type === constants.BALANCE && classes.balanceStyle
    );
  };

  const labelDisplayedRows = ({ from, to, count }) => {
    const first = to === -1 ? count : to;
    const second = count !== -1 ? count : "more than" + to;
    return `${from}-${first} из ${second}`;
  };

  let tableBody = <TableBody></TableBody>;

  if (!loading) {
    if (contractors && contractors.length > 0) {
      tableBody = (
        <TableBody>
          {contractors.map((contractor, index) => {
            const labelId = `enhanced-table-checkbox-${index}`;
            const balanceType =
              +contractor.balance > 0
                ? constants.OPERATION_INCOME
                : +contractor.balance < 0
                ? constants.OPERATION_OUTCOME
                : constants.BALANCE;
            return (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={contractor._id}
                classes={{
                  root: classes.tableRow,
                  selected: classes.tableRowSelect,
                }}
                component={Link}
                to={`${match.url}/${contractor._id}`}
              >
                <TableCell
                  component="th"
                  id={labelId}
                  scope="row"
                  padding="none"
                  className={classes.tableCell}
                  style={{ paddingRight: 45, paddingLeft: 30 }}
                >
                  <Typography
                    variant="subtitle2"
                    className={classes.transactionDateStyle}
                  >
                    {contractor.name}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box flexDirection="column">
                    {getAmount(contractor.balance, balanceType)}
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
            <TableCell style={{ paddingLeft: 0 }}>
              Контрагенты не найдены
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      );
    }
  }

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
          labelRowsPerPage={"Количество контрагентов на странице"}
          labelDisplayedRows={labelDisplayedRows}
        />
      </Paper>
    </div>
  );
};

export default EnhancedTable;
