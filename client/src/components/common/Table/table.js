import React, { useState, useEffect, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import moment from "moment";

import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

import EnhancedTableHead from "./tableHead";
import EnhancedTableToolbar from "./tableToolbar";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import clsx from "clsx";
import { Typography, Box, Grid } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import TransactionEditor from "components/home/OperationWorkers/updateTransaction";
import { splitByThree } from "utils/functions";
import constants from "constants/constants";
import { useStyles } from "./style";
import * as actions from "store/actions";

const EnhancedTable = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { projectId, contractorId } = useParams();
  const { projectsFilters, contractorsFilters } = props;
  const filters = projectId
    ? props.projectFilters
    : contractorId
    ? props.contractorFilters
    : props.filters;
  const loading = projectId
    ? props.projectIsloading
    : contractorId
    ? props.contractorIsloading
    : props.loading;
  const transactions = projectId
    ? props.projectTransactions
    : contractorId
    ? props.contractorTransactions
    : props.transactions;
  const totalItems = projectId
    ? props.projectTotalItems
    : contractorId
    ? props.contractorTotalItems
    : props.totalItems;
  const initialLoading = projectId
    ? props.projectInitialLoading
    : contractorId
    ? props.contractorInitialLoading
    : props.initialLoading;

  // const page = filters.page;
  // const rowsPerPage = filters.rowsPerPage;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [rowDataToChange, setRowDataToChange] = useState({});
  const [drawerIsOpen, setDrawerState] = useState(false);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = transactions.map((transaction) => transaction._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleCheckBoxClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

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
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleChangePage = (event, newPage) => {
  //   const updatedFilters = {
  //     ...filters,
  //     page: newPage,
  //   };
  //   if (projectId) {
  //     props.onUpdateProjectFilters(updatedFilters);
  //     props.onFetchProject(user.token, projectId, updatedFilters);
  //   }
  //   if (contractorId) {
  //     props.onUpdateContractorFilters(updatedFilters);
  //     props.onFetchContractor(user.token, contractorId, updatedFilters);
  //   } else {
  //     props.onUpdateFilters(updatedFilters);
  //     props.onFetchTransactions(user.token, updatedFilters);
  //   }
  // };

  // const handleChangeRowsPerPage = (event) => {
  //   const rowsPerPage = parseInt(event.target.value, 10);

  //   const updatedFilters = {
  //     ...props.filters,
  //     page: 0,
  //     rowsPerPage: rowsPerPage,
  //   };
  //   if (projectId) {
  //     props.onUpdateProjectFilters(updatedFilters);
  //     props.onFetchProject(user.token, projectId, updatedFilters);
  //   }
  //   if (contractorId) {
  //     props.onUpdateContractorFilters(updatedFilters);
  //     props.onFetchContractor(user.token, contractorId, updatedFilters);
  //   } else {
  //     props.onUpdateFilters(updatedFilters);
  //     props.onFetchTransactions(user.token, updatedFilters);
  //   }
  // };

  const getCallBack = () => {
    let filters = props.filters;
    let callback = function () {
      props.onFetchTransactions(user.token, filters);
    };
    if (projectId) {
      filters = props.projectFilters;
      callback = function () {
        props.onFetchProject(user.token, projectId, filters);
      };
    }
    if (contractorId) {
      filters = props.contractorFilters;
      callback = function () {
        props.onFetchContractor(user.token, contractorId, filters);
      };
    }
    return callback;
  };

  const handleCheckIconClick = (transactionId) => {
    props.onChangePlannedToFalse(user.token, transactionId, getCallBack());
  };

  const getAmount = (amount, currency, type) => {
    let amountValue = parseFloat(amount).toFixed(2);
    if (type && type === constants.OPERATION_INCOME) {
      amountValue = `+${amountValue}`;
    }
    if (type && type === constants.OPERATION_OUTCOME) {
      amountValue = `-${amountValue}`;
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
      <Typography className={clsx(getAmountStyle(type))}>
        {amountValue}
        {` `}
        {currencyPart}
      </Typography>
    );
  };

  const getAmountStyle = (type) => {
    return clsx(
      type === constants.OPERATION_INCOME && classes.incomeStyle,
      type === constants.OPERATION_OUTCOME && classes.expenseStyle,
      !type && classes.accountBalance
    );
  };

  const isSelected = (transactionId) => selected.indexOf(transactionId) !== -1;

  const labelDisplayedRows = ({ from, to, count }) => {
    const first = to === -1 ? count : to;
    const second = count !== -1 ? count : "more than" + to;
    return `${from}-${first} из ${second}`;
  };

  const getDayInString = (date) => {
    const transactionDate = moment(date).format("YYYY-MM-DD");

    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    if (moment(transactionDate).isSame(today)) {
      return "Сегодня";
    }
    if (moment(transactionDate).isSame(yesterday)) {
      return "Вчера";
    }
    const dayInString = moment(transactionDate).format("DD.MM.YYYY");
    return dayInString;
  };

  let tableBody = <TableBody></TableBody>;

  if (!loading && !initialLoading) {
    if (transactions && transactions.length > 0) {
      tableBody = (
        <TableBody>
          {transactions &&
            transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction, index) => {
                const isItemSelected = isSelected(transaction._id);
                const labelId = `enhanced-table-checkbox-${index}`;
                const isSame = moment(transaction.date).isSame(
                  transaction.relatedDate
                );
                const dayInString = getDayInString(transaction.date);
                const showCheckIcon =
                  moment() >= moment(transaction.date) && transaction.isPlanned;
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleRowClick(event, transaction)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={transaction._id}
                    selected={isItemSelected}
                    classes={{
                      root: clsx(
                        classes.tableRow,
                        transaction.isPlanned && classes.plannedTransaction
                      ),
                      selected: classes.tableRowSelect,
                    }}
                  >
                    <TableCell
                      padding="checkbox"
                      style={{ padding: "0 10px" }}
                      className={classes.tableCell}
                    >
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                        color="primary"
                        onChange={(event) =>
                          handleCheckBoxClick(event, transaction._id)
                        }
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      className={classes.tableCell}
                    >
                      <Grid container alignItems="center">
                        <Grid item>
                          <Typography className={classes.transactionDateStyle}>
                            {/* {moment(transaction.date).format("DD.MM.YYYY")} */}
                            {dayInString}
                          </Typography>
                          {!isSame && (
                            <Typography className={classes.accrualDateStyle}>
                              {" "}
                              {moment(transaction.relatedDate).format(
                                "DD.MM.YYYY"
                              )}
                            </Typography>
                          )}
                        </Grid>
                        {showCheckIcon && (
                          <Grid item>
                            <div
                              className={classes.checkIconContainer}
                              onClick={() =>
                                handleCheckIconClick(transaction._id)
                              }
                            >
                              <CheckCircleOutlineIcon color="primary" />
                            </div>
                          </Grid>
                        )}
                      </Grid>
                    </TableCell>
                    <TableCell>
                      {getAmount(
                        transaction.amount,
                        transaction.account.currency,
                        transaction.type
                      )}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {transaction.category && transaction.category.name}
                    </TableCell>
                    {!projectId && (
                      <TableCell className={classes.tableCell}>
                        {transaction.project && transaction.project.name}
                      </TableCell>
                    )}
                    {!contractorId && (
                      <TableCell className={classes.tableCell}>
                        {transaction.contractor && transaction.contractor.name}
                      </TableCell>
                    )}
                    <TableCell className={classes.tableCell}>
                      {transaction.account && transaction.account.name}
                    </TableCell>
                    {!projectId && !contractorId && (
                      <TableCell className={classes.accountBalance}>
                        <div>
                          {transaction.type === constants.OPERATION_INCOME ? (
                            <ArrowDropUpIcon
                              classes={{
                                root: classes.arrowUp,
                              }}
                            />
                          ) : (
                            <ArrowDropDownIcon color="error" size="" />
                          )}
                          {getAmount(
                            transaction.accountBalance,
                            transaction.account.currency
                          )}
                        </div>
                      </TableCell>
                    )}
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
            <TableCell></TableCell>
            <TableCell style={{ paddingLeft: 0 }}>
              Операции не найдены
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      );
    }
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          selected={selected}
          numSelected={selected.length}
          rowCount={transactions && transactions.length}
          setSelected={(arr) => setSelected(arr)}
          projectsFilters={projectId ? projectsFilters : null}
          contractorsFilters={contractorId ? contractorsFilters : null}
          setChecked={setChecked}
        />
        <TableContainer>
          <Table
            classdate={classes.table}
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              setChecked={setChecked}
              checked={checked}
            />
            {tableBody}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[7, 10, 15]}
          component="div"
          // count={transactions.length}
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          labelRowsPerPage={"Количество операции на странице"}
          labelDisplayedRows={labelDisplayedRows}
        />
      </Paper>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleDrawerClose(e, false)}
      >
        <TransactionEditor
          setDrawerState={setDrawerState}
          action={rowDataToChange.type}
          transaction={rowDataToChange}
          filters={props.filters}
        />
      </Drawer>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    transactions: state.transactions.transactions.transactions,
    projectTransactions: state.projects.project.transactions,
    contractorTransactions: state.contractors.contractor.transactions,
    //transactions

    filters: state.transactions.filters,
    projectFilters: state.projects.project.filters,
    contractorFilters: state.contractors.contractor.filters,
    //filters

    totalItems: state.transactions.transactions.totalItems,
    projectTotalItems: state.projects.project.totalItems,
    contractorTotalItems: state.contractors.contractor.totalItems,
    // totalItems

    loading: state.transactions.loading,
    projectIsloading: state.projects.loading,
    contractorIsloading: state.contractors.loading,
    //loading
    initialLoading: state.transactions.initialLoading,
    projectInitialLoading: state.projects.initialLoading,
    contractorInitialLoading: state.contractors.initialLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    //filters
    onUpdateFilters: (filters) => dispatch(actions.updateFilters(filters)),
    onUpdateProjectFilters: (filters) =>
      dispatch(actions.updateProjectFilters(filters)),
    onUpdateContractorFilters: (filters) =>
      dispatch(actions.updateContractorFilters(filters)),

    //transactions
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
    //projects
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
    //contractors
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
    //actions
    onChangePlannedToFalse: (token, transactionId, callback) =>
      dispatch(actions.changePlannedToFalse(token, transactionId, callback)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedTable);
