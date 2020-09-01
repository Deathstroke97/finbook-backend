import React from "react";
import GetAppIcon from "@material-ui/icons/GetApp";
import { makeStyles, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-start",
    marginTop: "15px"
  },

  whiteButton: {
    width: 110,
    marginTop: 14,
    backgroundColor: "#fff",
    "& img": {
      width: "15px",
      height: "20px",
      marginRight: "10px",
      marginLeft: "-4px"
    }
  }
}));

const Actions = props => {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      classes={{ root: classes.whiteButton }}
      onClick={e => console.log("export have not yet supported")}
    >
      <GetAppIcon fontSize="small" />
      Экспорт
    </Button>
  );
};

export default Actions;
