import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import constants from "constants/constants";
import TransactionEditor from "components/home/OperationWorkers/updateTransaction";
import ObligationUpdate from "components/common/update/obligation";

import * as actions from "store/actions/index";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import moment from "moment";

import EnhancedTableHead from "./tableHead";
import EnhancedTableToolbar from "./tableToolbar";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import clsx from "clsx";
import { Typography, Box } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import OperationWorker from "components/home/OperationWorkers/operationWorker";
import { splitByThree } from "utils/functions";

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
  },
  tableRowSelect: {
    backgroundColor: "transparent !important",
  },
  tableCell: {},

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
  },
  expenseStyle: {
    color: theme.palette.error.main,
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
  description: {
    fontSize: 13.5,
  },
}));

const EnhancedTable = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const [selected, setSelected] = useState([]);
  const [drawerIsOpen, setDrawerState] = useState(false);
  const { contractorId } = useParams();

  const filters = props.filters;
  const page = filters.page;
  const rowsPerPage = filters.rowsPerPage;

  const totalItems = props.obligationTotalItems;

  console.log("totalItems: ", totalItems);
  console.log("page: ", page);
  console.log("rowPerPage: ", rowsPerPage);

  const [rowDataToChange, setRowDataToChange] = useState({});

  const handleRowClick = (event, row) => {
    if (event.target.nodeName === "svg") return;
    if (event.target.nodeName === "INPUT") return;
    setRowDataToChange(row);
    setDrawerState(true);
  };

  const handleDrawerClose = (event, open, actionType) => {
    setDrawerState(false);
  };

  const handleChangePage = (event, newPage) => {
    const updatedFilters = {
      ...filters,
      page: newPage,
    };

    if (contractorId) {
      props.onUpdateContractorFilters(updatedFilters);
      props.onFetchContractor(user.token, contractorId, updatedFilters);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);

    const updatedFilters = {
      ...props.filters,
      page: 0,
      rowsPerPage: rowsPerPage,
    };

    props.onUpdateContractorFilters(updatedFilters);
    props.onFetchContractor(user.token, contractorId, updatedFilters);
  };

  const genCellText = (amount, type) => {
    let arr = amount.split(".");
    let integerPart = arr[0];
    let decimalPart = arr[1];
    let result = splitByThree(integerPart) + "." + decimalPart;
    return type === constants.OPERATION_INCOME ? `+${result}` : `-${result}`;
  };

  const genCellStyle = (amount, type) => {
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

  const getDayInString = (date) => {
    const transactionDate = moment(date).format("YYYY-MM-DD");
    const dayInString = moment(transactionDate).format("DD.MM.YYYY");
    return dayInString;
  };

  let tableBody = <TableBody></TableBody>;

  if (!props.loading) {
    if (props.obligations && props.obligations.length > 0) {
      tableBody = (
        <TableBody>
          {props.obligations.map((obligation, index) => {
            const labelId = `enhanced-table-checkbox-${index}`;
            const transaction = obligation.transaction;
            const dayInString = getDayInString(obligation.date);
            const type =
              obligation.type === constants.OBLIGATION_IN
                ? constants.OPERATION_OUTCOME
                : constants.OPERATION_INCOME;
            const reverseType =
              type === constants.OPERATION_OUTCOME
                ? constants.OPERATION_INCOME
                : constants.OPERATION_OUTCOME;
            return (
              <TableRow
                hover
                onClick={(event) => handleRowClick(event, obligation)}
                role="checkbox"
                tabIndex={-1}
                key={obligation._id}
                classes={{
                  root: classes.tableRow,
                  selected: classes.tableRowSelect,
                }}
              >
                <TableCell
                  component="th"
                  id={labelId}
                  scope="row"
                  padding="none"
                  className={classes.tableCell}
                  style={{ paddingRight: 45, paddingLeft: 30 }}
                >
                  <Typography className={classes.transactionDateStyle}>
                    {dayInString}
                  </Typography>
                </TableCell>
                <TableCell className={genCellStyle(obligation.amount, type)}>
                  {genCellText(obligation.amount, type)}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {transaction ? (
                    <Typography className={classes.description}>
                      На оснавании операции &nbsp;
                      <span
                        className={genCellStyle(obligation.amount, reverseType)}
                      >
                        {genCellText(obligation.amount, reverseType)} &nbsp;
                      </span>
                      от {moment(obligation.date).format("DD.MM.YYYY")}
                    </Typography>
                  ) : (
                    <Typography>
                      {transaction && transaction.description}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      );
    }
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          rowsPerPage={rowsPerPage}
          count={totalItems}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          labelRowsPerPage={"Количество обязательств на странице"}
          labelDisplayedRows={labelDisplayedRows}
        />
      </Paper>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleDrawerClose(e, false)}
      >
        <ObligationUpdate
          action={rowDataToChange.type}
          setDrawerState={setDrawerState}
          obligation={rowDataToChange}
          filters={props.filters}
        />
        {/* <TransactionEditor
          setDrawerState={setDrawerState}
          action={
            rowDataToChange.type === constants.OBLIGATION_IN
              ? constants.OPERATION_INCOME
              : constants.OPERATION_OUTCOME
          }
          transaction={rowDataToChange}
          filters={props.filters}
        /> */}
      </Drawer>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    obligations: state.contractors.contractor.obligations,
    filters: state.contractors.contractor.filters,
    obligationTotalItems: state.contractors.contractor.obligationTotalItems,
    loading: state.contractors.initialLoading,
  };
};

export default connect(mapStateToProps, null)(EnhancedTable);
