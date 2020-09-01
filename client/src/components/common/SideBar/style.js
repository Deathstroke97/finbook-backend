import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    backgroundColor: "#fff",
    height: "100%",
    boxShadow: "7px -11px 14px -11px rgba(90,97,105,1)",
    position: "fixed",
    top: 0,
    width: "18%",
    zIindex: "1070"
  },
  head: {
    fontSize: "13px",
    fontWeight: 400,
    color: "rgb(0,0,0,0.87)",
    textAlign: "left",
    borderBottom: "1px solid #e1e5eb",
    padding: "16px 30px"
  },
  nav: {
    listStyleType: "none",
    width: "100%",
    paddingLeft: 0,
    overflow: "hidden"
  },
  navItem: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    "& p": {
      fontWeight: 400,
      color: "rgb(90, 97, 105)",
      color: "rgba(0,0,0,0.87)"
    }
  },

  navItemContainer: {
    "& a": {
      display: "flex",
      padding: "15px 30px",
      width: "100%",
      textDecoration: "none",
      "&:hover": {
        boxShadow: "inset 0.1875rem 0 0 #007bff",
        backgroundColor: "#fbfbfb",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        color: "#007bff",
        transition: "all 0.2 ease",
        cursor: "pointer"
      },
      "&.active": {
        boxShadow: "inset 0.1875rem 0 0 #007bff",
        backgroundColor: "#fbfbfb",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        color: "#007bff",
        transition: "all 0.2 ease",
        cursor: "pointer",
        "& p": {
          color: "#007bff"
        }
      },

      color: "rgb(90, 97, 105)",
      fontWeight: theme.typography.fontWeightRegular,
      textOverflow: "hidden",
      height: "50px"
    }
  },

  active: {
    boxShadow: "inset 0.1875rem 0 0 #007bff",
    backgroundColor: "#fbfbfb",
    color: "#007bff",
    transition: "all 0.2 ease",
    cursor: "pointer"
  }
}));
