import React, { useContext } from "react";
import SideBar from "components/common/SideBar/sideBar";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "components/common/Toolbar/toolbar";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
    height: "auto",
    width: "100%",
  },
  space: {
    width: "18%",
  },
  main: {
    height: "100vh",
    maxHeight: "100vh",
    overflow: "auto",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    backgroundColor: "rgb(241, 242, 245)",
  },
  container: {
    padding: 20,
  },
}));

export default function DefaultLayout(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <SideBar />
      <div className={classes.space}></div>
      <div className={classes.main}>
        <Toolbar />
        <div className={classes.container}>{props.children}</div>
      </div>
    </div>
  );
}
