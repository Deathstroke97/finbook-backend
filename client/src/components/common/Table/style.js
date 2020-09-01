import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    // marginTop: 14,
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
      cursor: "pointer",
      backgroundColor: "rgb(210, 235, 253) !important",
    },

    padding: 20,
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
  },
  arrowUp: {
    color: theme.palette.success.main,
  },
  incomeStyle: {
    fontSize: 14,
    color: theme.palette.success.main,
  },
  expenseStyle: {
    fontSize: 14,
    color: theme.palette.error.main,
  },
  accountBalance: {
    fontSize: 14,
    "& > div": {
      display: "flex",
      alignItems: "center",
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
  noOperationWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& > p": {
      paddingTop: theme.spacing(2),
      paddingBotttom: theme.spacing(2),
    },
  },
  plannedTransaction: {
    backgroundColor: "#fffcf3",
  },
  checkIconContainer: {
    marginLeft: 7,
    marginTop: 3,
    "&:hover": {
      "& svg": {
        color: "#0056d3",
      },
    },
  },
  // checkIcon: {
  //   "&:hover": {
  //     "& svg": {
  //       color: "#0056d3",
  //     },
  //   },
  // },
}));
