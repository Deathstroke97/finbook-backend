import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import TimelineIcon from "@material-ui/icons/Timeline";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  notification: {
    display: "flex",
    whiteSpace: "normal",
    padding: "10px 14px",
    borderBottom: "1px solid #e1e5eb",
    "&:hover": {
      backgroundColor: "#fafafb"
    },
    width: "400px",
    height: "79px"
  },
  notificationIconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    borderRadius: "50%",
    backgroundColor: "#666",
    height: "38px",
    width: "38px",
    backgroundColor: "#f5f6f8",
    boxShadow: "0 0 0 1px #fff, inset 0 0 3px rgba(0,0,0,.2)",
    marginRight: 16,
    color: "rgba(0,0,0,.2)"
  },
  notificationContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: 12,
    "& > span": {
      margin: 0,
      color: "#818ea3",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      marginBottom: 5,
      fontWeight: 500
    },
    "& p": {
      margin: 0,
      "& span": {}
    }
  },
  successText: {
    color: theme.palette.success.main,
    fontSize: 12
  },
  dangerText: {
    color: theme.palette.error.main,
    fontSize: 12
  }
}));

const NotificationItem = props => {
  const { success, danger } = props;
  const classes = useStyles();
  return (
    <div className={classes.notification}>
      <div className={classes.notificationIconWrapper}>
        <TimelineIcon fontSize="small" />
      </div>
      <div className={classes.notificationContent}>
        <span>Analytics</span>
        <p>
          Your website’s active users count increased by{" "}
          <Typography
            component="span"
            className={success ? classes.successText : classes.dangerText}
          >
            28%
          </Typography>{" "}
          in the last week. Great job!
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
