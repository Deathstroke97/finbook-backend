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
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Имя"
  },
  { id: "email", numeric: false, disablePadding: false, label: "Эл.почта" },
  {
    id: "phone",
    numeric: true,
    disablePadding: false,
    label: "Телефон"
  },
  { id: "status", numeric: true, disablePadding: false, label: "Статус" }
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
};

export default EnhancedTableHead;
