import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";

const data = [
  {
    id: "date",
    numeric: true,
    disablePadding: true,
    label: "Дата",
  },
  { id: "amount", numeric: true, disablePadding: false, label: "Операция" },
  {
    id: "category",
    numeric: true,
    disablePadding: false,
    label: "Статья",
  },
  { id: "project", numeric: true, disablePadding: false, label: "Проект" },
  {
    id: "contractor",
    numeric: true,
    disablePadding: false,
    label: "Контрагент",
  },
  { id: "account", numeric: true, disablePadding: false, label: "Счет" },
  {
    id: "accountBalance",
    numeric: true,
    disablePadding: false,
    label: "Состояние счета",
  },
];

const EnhancedTableHead = (props) => {
  const { classes, onSelectAllClick, setChecked, checked } = props;
  const { projectId, contractorId } = useParams();
  let headCells = data;
  if (projectId) {
    headCells = headCells.filter(
      (headCell) =>
        headCell.id !== "project" && headCell.id !== "accountBalance"
    );
  }
  if (contractorId) {
    headCells = headCells.filter(
      (headCell) =>
        headCell.id !== "contractor" && headCell.id !== "accountBalance"
    );
  }

  const handleCheckBoxChange = (e) => {
    setChecked(!checked);
    onSelectAllClick(e);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" style={{ padding: "0 10px" }}>
          <Checkbox
            checked={checked}
            onChange={handleCheckBoxChange}
            inputProps={{ "aria-label": "select all desserts" }}
            color="primary"
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            style={{ minWidth: 130 }}
            className={classes.headCell}
            // align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default EnhancedTableHead;
