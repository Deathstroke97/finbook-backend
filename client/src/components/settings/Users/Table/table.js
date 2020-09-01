import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

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

// transactionDate
// accrualDate
// amount
// article
// project,
// counterparty,
// account,

// date,
// amount,
// article,
// project,
// counterparty,
// account,
// balance
function createData(id, data, name, email, phone, status) {
  return {
    id,
    data,
    name,
    email,
    phone,
    status,
  };
}

const dummy_operations = [
  createData(
    "dsdsafdfa",
    new Date(2019, 11, 10),
    "Almas",
    "almas.2007@gmail.com",
    "8-778-347-68-40",
    "Активен"
  ),
  createData(
    "dsdsafdfatrsrg",
    new Date(2019, 11, 8),
    "Askar",
    "almas.2007@gmail.com",
    "8-778-347-68-40",
    "Активен"
  ),
  createData(
    "fdlkrhntnr",
    new Date(2019, 10, 16),
    "Олжас",
    "almas.2007@gmail.com",
    "8-778-347-68-40",
    "Активен"
  ),
  createData(
    "bkjsnrtjgnadrf",
    new Date(2019, 2, 4),
    "Aruzhan",
    "almas.2007@gmail.com",
    "8-778-347-68-40",
    "Удален"
  ),
];

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  // console.log("stabilizedThis: ", stabilizedThis);

  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

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
  tableCell: {
    // backgroundColor: "rgb(255, 252, 239)"
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
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [operations, setOperations] = useState(dummy_operations);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("transactionDate");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rowDataToChange, setRowDataToChange] = useState({});
  const [drawerIsOpen, setDrawerState] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = operations.map((n, index) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
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

  const deleteOperations = () => {
    let newOperations = [];
    operations.forEach((operation) => {
      if (selected.indexOf(operation.id) == -1) {
        newOperations.push(operation);
      }
    });

    setSelected([]);
    setOperations(newOperations);
  };

  const handleRowClick = (event, row) => {
    if (event.target.nodeName == "INPUT") return;
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

  // const genCellText = value => {
  //   return String(value.toFixed(2)) + " P";
  // };
  const genCellText = (value) => {
    let isNegative = value > 0 ? false : true;
    let actual = Math.abs(value) / 100;
    let integerPart = Math.trunc(actual);
    let decimalPart = Math.round((actual % 1) * 100);

    let str = decimalPart == 0 ? "00" : decimalPart;
    let result = splitByThree(integerPart) + "," + str;
    return isNegative ? "-" + result : result;
  };

  const genCellStyle = (value) => {
    return clsx(
      value > 0 && classes.incomeStyle,
      value < 0 && classes.expenseStyle
    );
  };

  const isSelected = (date) => selected.indexOf(date) !== -1;

  const labelDisplayedRows = ({ from, to, count }) => {
    const first = to == -1 ? count : to;
    const second = count !== -1 ? count : "more than" + to;

    return `${from}` + "-" + `${first}` + " из " + second;
  };

  // const emptyRows =
  //   rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  console.log("selected: ", selected);
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          deleteOperations={deleteOperations}
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
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={operations.length}
            />
            <TableBody>
              {stableSort(operations, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleRowClick(event, row)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.transactionDate}
                      selected={isItemSelected}
                      classes={{
                        root: classes.tableRow,
                        selected: classes.tableRowSelect,
                      }}
                    >
                      <TableCell
                        className={classes.tableCell}
                        style={{ paddingRight: 45, paddingLeft: 30 }}
                      >
                        {row.name}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.email}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.phone}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.status}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={operations.length}
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
        <OperationWorker
          setDrawerState={setDrawerState}
          action={"income"}
          operation={rowDataToChange}
          editing
        />
      </Drawer>
    </div>
  );
}
