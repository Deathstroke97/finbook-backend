import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    width: 600,
    padding: "35px 30px",
    overflowY: "scroll",

    height: "100%",
    "& form": {
      "& > div": {
        width: "100%",
        marginTop: 10,
      },
    },
  },
  transactionNameText: {
    marginBottom: 10,
    fontSize: 22,
    marginLeft: 2,
    fontWeight: theme.typography.fontWeightMedium,
  },
  row: {
    display: "flex",
    marginTop: 10,
    "& > div": {
      flex: 1,
      "&:not(:last-child)": {
        marginRight: 10,
      },
    },
    "& > button": {
      "&:not(:last-child)": {
        marginRight: 10,
      },
    },
  },
  buttonContainer: {
    "& > button": {
      "&:not(:last-child)": {
        marginRight: 10,
      },
    },
  },
  rootLable: {
    height: 30,
  },
  label: {
    fontSize: 15,
  },
  addButton: {
    // backgroundColor: "rgb(101, 84, 171)",
    backgroundColor: "#7252d3",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#845ae0",
    },
  },
  deleteButton: {
    backgroundColor: "#d83c31",
    "&:hover": {
      backgroundColor: "#e6533c",
    },
  },
  terminology: {
    lineHeight: 1.2,

    fontSize: 14,
    "& > span": {
      fontWeight: theme.typography.fontWeightBold,
      color: "rgb(51, 51, 51)",
    },
    marginTop: 20,
    color: "rgb(51, 51, 51)",
    lineHeight: "20px",
  },
  leftMarginSmall: {
    marginLeft: "-2px",
  },
  leftMarginBig: {
    marginLeft: "10px",
  },
  buttonDeleteAccept: {
    background: theme.palette.error.main,
    textTransform: "none",
    color: theme.palette.common.white,
    "&:hover": {
      background: "#f77975",
    },
  },
  buttonСancelRepetition: {
    color: theme.palette.common.black,
  },
}));
