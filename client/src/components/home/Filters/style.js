import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    // height: "50px",
    alignItems: "center",
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
  menuItemText: {
    fontWeight: 400,
    color: theme.palette.secondary.text,
    fontSize: "14px",
  },
  selectEmpty: {
    marginTop: theme.spacing(5),
  },
  selectRoot: {
    height: "40px",
  },
  buttonGroup: {
    background: "#fff",
    width: "100px",
  },
  buttonLabel: {
    color: theme.palette.secondary.text,
    fontSize: "14px",
    fontWeight: 400,
    textTransform: "none",
  },
  contained: {
    border: "1px solid rgba(0, 0, 0, 0.2)",
    boxShadow: "none",
    // marginLeft: "8px"
  },
  button: {
    // "&:hover": {
    //   backgroundColor: "red"
    // }
  },
  activeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  row: {
    display: "flex",
    width: "30%",
    marginLeft: 15,
    marginRight: 15,
    "& > div": {
      flex: 1,
      "&:not(:last-child)": {
        marginRight: 10,
      },
    },
  },
}));
