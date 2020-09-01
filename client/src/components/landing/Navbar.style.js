import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "center",
    position: "fixed",
    top: 0,
    width: "100%",

    flexGrow: 1,
    backgroundColor: "#fafafa",
    zIndex: 1,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      position: "absolute",
    },
  },
  navbar: {
    display: "flex",
    width: "80%",
    position: "relative",
    padding: "22px 0",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      padding: "10px 10px",
      marginBottom: "25px",
    },
  },
  left: {
    display: "flex",
    width: "20%",
  },
  right: {
    display: "flex",
    width: "80%",
    flexDirection: "row",
    justifyContent: "flex-end",
    "@media (max-width:1100px)": {
      flexDirection: "column",
      // backgroundColor: "pink",
      width: "100%",
      marginTop: "10px",
    },
  },
  menuIcon: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      position: "absolute",
      right: 0,
      top: 0,
    },
  },
  link: {
    color: "rgba(0, 0, 0, 0.5)",
    fontWeight: theme.typography.fontWeightBold,
    fontSize: "20px",
    "&:hover": {
      color: "rgba(0,0,0,0.7)",
      transition: "0.6s",
    },
    alignSelf: "center",
    "&:not(:last-child)": {
      paddingRight: "25px",
    },
    cursor: "pointer",
    [theme.breakpoints.down("sm")]: {
      // backgroundColor: "red",
      "&:not(:last-child)": {
        paddingBottom: "15px",
      },
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "16px",
    },
    "@media (max-width:1100px)": {
      paddingBottom: "15px",
    },
  },
  brandName: {
    fontWeight: theme.typography.fontWeightBold,
    color: "rgba(0,0,0,0.87)",
    fontSize: "25px",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "500px",
  },
  scrollPaper: {
    alignItems: "baseline",
  },
  marginTextField: {
    // "& > div": {
    //   marginBottom: 15,
    // },
    "& > div:not(last-child)": {
      marginBottom: 15,
    },
  },
  dialogTitle: {
    fontWeight: theme.typography.fontWeightBold,
  },
  dialogContentText: {
    fontWeight: 700,
    color: "rgb(85, 90, 100)",
  },
}));
