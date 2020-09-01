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
  operationNameText: {
    marginBottom: 10,
    fontSize: 22,
    marginLeft: 2,
    fontWeight: theme.typography.fontWeightMedium,
  },
  row: {
    display: "flex",
    "& > div": {
      flex: 1,
      "&:not(:last-child)": {
        marginRight: 10,
      },
    },
  },

  button: {
    marginRight: 10,
    backgroundColor: "rgb(101, 84, 171)",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgba(128,114, 183,1)",
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
  deleteButton: {
    background: theme.palette.error.main,
    textTransform: "none",
    color: theme.palette.common.white,
    "&:hover": {
      background: "#f77975",
    },
  },
  label: {
    fontSize: 13,
  },
}));
