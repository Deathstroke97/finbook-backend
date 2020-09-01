import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    // height: "50px",
    alignItems: "center",
    justifyContent: "start",
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
  row: {
    display: "flex",
    // width: "100%",
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
