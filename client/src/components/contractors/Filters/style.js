import { makeStyles } from "@material-ui/core";
export const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    "& > div": {
      display: "flex",
      "&:last-child": {
        marginTop: 10
      }
    }
  },
  formControl: {
    // margin: theme.spacing(1),
    marginRight: 8,
    minWidth: 190,
    "& > div": {
      height: "38px",
      backgroundColor: "#fff"
    }
  },
  contained: {
    border: "1px solid rgba(0, 0, 0, 0.2)",
    boxShadow: "none"
  },
  button: {
    background: "transparent"
  },
  activeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.08)"
  },
  buttonLabel: {
    color: theme.palette.secondary.text,
    fontSize: "14px",
    fontWeight: 400,
    textTransform: "none"
  },
  textFieldRoot: {
    [`& fieldset`]: {
      borderRadius: 4
    },
    marginTop: -1,
    marginLeft: 8
  }
}));
