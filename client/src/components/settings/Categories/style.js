import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: "space-around",
    alignItems: "flex-start",
  },
  column: {
    display: "flex",
    display: "column",
    width: "30%",
    marginRight: 50,
    "& > ul": {
      marginTop: 20,
      listStyleType: "none",
      "& > li": {
        padding: 7,
        cursor: "pointer",
        backgroundColor: "rgb(241, 242, 245)",
        "&:not(:last-child)": {
          marginBottom: 5,
        },
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        color: "rgb(98, 98, 98)",
        fontSize: 14,
      },
    },
    "& h5": {
      fontFamily: '"PT Sans",Tahoma,sans-serif',
      color: "#626262",
      fontSize: 14,
      textTransform: "uppercase",
      fontWeight: 600,
    },
    "& > p": {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.grey[600],
      textTransform: "uppercase",
    },
    paddingBottom: 25,
  },
  inputRoot: {
    width: 320,
    "& fieldset": {
      borderRadius: 4,
    },
  },
  button: {
    backgroundColor: "rgb(101, 84, 171)",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgb(101, 84, 171)",
    },
  },
}));
