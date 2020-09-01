import React, { useState } from "react";
import PropTypes from "prop-types";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const headCells = [
  {
    id: "infoText",
    numeric: false,
    disablePadding: true,
    label: "Название"
  },
  {
    id: "column",
    numeric: true,
    disablePadding: false,
    label: ""
  },
  { id: "income", numeric: true, disablePadding: false, label: "Доходы" },
  {
    id: "expense",
    numeric: true,
    disablePadding: false,
    label: "Расходы"
  },
  {
    id: "grossProfit",
    numeric: true,
    disablePadding: false,
    label: "Валовая прибыль"
  },
  {
    id: "profitability",
    numeric: true,
    disablePadding: false,
    label: "Рентабельность"
  }
];

function EnhancedTableHead(props) {
  const { classes } = props;

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
  classes: PropTypes.object.isRequired
  // numSelected: PropTypes.number.isRequired,
  // onRequestSort: PropTypes.func.isRequired,
  // onSelectAllClick: PropTypes.func.isRequired,
  // order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  // orderBy: PropTypes.string.isRequired,
  // rowCount: PropTypes.number.isRequired
};

export default EnhancedTableHead;
