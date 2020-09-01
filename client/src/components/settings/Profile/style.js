import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "& > div": {
      "&:not(:last-child)": {
        marginRight: 10
      }
    },
    width: "50%",
    "& > p": {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.grey[600],
      textTransform: "uppercase"
    },
    paddingBottom: 25
  },
  inputRoot: {
    width: 320,
    "& fieldset": {
      borderRadius: 4
    }
  },
  button: {
    backgroundColor: "rgb(101, 84, 171)",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgb(101, 84, 171)"
    }
  }
}));
