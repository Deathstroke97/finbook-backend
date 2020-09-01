import React, { useState } from "react";
import PropTypes from "prop-types";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core";

// const useStyles = makeStyles(theme => ({
//   tableRow: {
//     // "&:hover": {
//     backgroundColor: "rgb(210, 235, 253) !important"
//     // }
//   }
// }));

const headCells = [
  {
    id: "transactionDate",
    numeric: true,
    disablePadding: true,
    label: "Дата"
  },
  { id: "operation", numeric: true, disablePadding: false, label: "Баланс" },
  {
    id: "article",
    numeric: true,
    disablePadding: false,
    label: "Описание"
  }
];

function EnhancedTableHead(props) {
  // const classesMine = useStyles();
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort
  } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, "transactionDate");
    //property was in place of date
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            style={{ minWidth: 130 }}
            className={classes.headCell}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

export default EnhancedTableHead;
