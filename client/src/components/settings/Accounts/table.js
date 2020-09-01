import React, { useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions";
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
import Drawer from "@material-ui/core/Drawer";

import EnhancedTableHead from "./tableHead";
import EnhancedTableToolbar from "./tableToolbar";
import { Typography, Box } from "@material-ui/core";
import AccountEditor from "components/common/update/account";
import CashBoxEditor from "components/common/update/cashbox";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: 14,
  },
  paper: {
    width: "100%",
    border: "1px solid rgba(0,0,0,0.1)",
    boxShadow: theme.shadows[1],
    // marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
    border: "1px solid black",
    "& p": {
      fontSize: 14,
    },
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
      cursor: "pointer",
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
  const { user } = useContext(SessionContext);
  const { accounts, loading } = props;

  const match = useRouteMatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [clickedAccount, setClickedAccount] = useState(null);
  const [drawerIsOpen, setDrawerState] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAccountClick = (account) => {
    setClickedAccount(account);
    setDrawerState(true);
  };

  const handleDrawerClose = (event, open, actionType) => {
    setDrawerState(false);
  };

  const getAmount = (amount, currency, type) => {
    let amountValue = splitByThree(parseFloat(amount).toFixed(2));
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
      <Typography variant="subtitle2">
        {amountValue}
        {` `}
        {currencyPart}
      </Typography>
    );
  };

  const labelDisplayedRows = ({ from, to, count }) => {
    const first = to === -1 ? count : to;
    const second = count !== -1 ? count : "more than" + to;
    return `${from}-${first} из ${!second ? 0 : second}`;
  };

  let tableBody = <TableBody></TableBody>;
  console.log("loading: ", loading);
  console.log("accounts: ", accounts);

  if (!loading) {
    if (accounts && accounts.length > 0) {
      tableBody = (
        <TableBody>
          {accounts.map((account, index) => {
            const labelId = `enhanced-table-checkbox-${index}`;
            return (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={account._id}
                classes={{
                  root: classes.tableRow,
                }}
                onClick={() => handleAccountClick(account)}
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
                    {account.name}
                  </Typography>
                </TableCell>

                <TableCell>
                  {getAmount(account.balance, account.currency)}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {account.bankName ? account.bankName : ""}
                  </Typography>
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
        <EnhancedTableToolbar />
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
          count={!!accounts && accounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          labelRowsPerPage={"Количество cчетов на странице"}
          labelDisplayedRows={labelDisplayedRows}
        />
      </Paper>
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={(e) => handleDrawerClose(e, false)}
      >
        {clickedAccount &&
          (clickedAccount.type === constants.ACCOUNT ? (
            <AccountEditor
              setDrawerState={setDrawerState}
              account={clickedAccount}
            />
          ) : (
            <CashBoxEditor
              setDrawerState={setDrawerState}
              cashbox={clickedAccount}
            />
          ))}
      </Drawer>
    </div>
  );
};

// const mapStateToProps = (state) => {
//   return {
//     accounts: state.accounts.accounts,
//     loading: state.accounts.loading,
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   return {
//     onFetchAccounts: (token) => dispatch(actions.fetchAccounts(token)),
//   };
// };
// export default connect(mapStateToProps, mapDispatchToProps)(EnhancedTable);

export default EnhancedTable;
