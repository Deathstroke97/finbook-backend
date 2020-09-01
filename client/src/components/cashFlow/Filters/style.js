import { makeStyles } from "@material-ui/core";
export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  firstRowFilter: {
    display: "flex",
    alignItems: "center",
    "& > div:last-child": {
      marginLeft: 8,
    },
  },
  secondRowFilter: {
    display: "flex",
    marginTop: 15,
  },

  formControl: {
    // margin: theme.spacing(1),
    marginRight: 8,
    minWidth: 190,
    "& > div": {
      height: "38px",
      backgroundColor: "#fff",
    },
  },
  label: {
    // color: "red",
    fontSize: 14,
  },
  menuItemText: {
    fontWeight: 400,
    color: theme.palette.secondary.text,
    fontSize: "14px",
  },

  buttonGroup: {
    background: "#fff",
    // width: "100px"
  },
  contained: {
    border: "1px solid rgba(0, 0, 0, 0.2)",
    boxShadow: "none",
  },
  button: {},
  activeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  buttonLabel: {
    color: theme.palette.secondary.text,
    fontSize: "14px",
    fontWeight: 400,
    textTransform: "none",
  },
}));
