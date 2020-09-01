import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#007bff",
      // main: "#48b0f7",
    },
    secondary: {
      main: "rgb(85, 90, 100)",
      dark: "rgb(44, 48, 56)",
      light: "rgba(0, 0, 0, 0.5)",
      text: "rgba(0,0,0, 0.8)",
    },
    dashboard: {
      blue: "#0056d3",
      gray: "rgb(90, 97, 105)",
    },
    success: {
      // main: "rgb(10, 196, 173)",
      main: "rgb(13, 147, 91)",
    },
    error: {
      main: "rgb(185, 30, 30)",
    },
  },
  typography: {
    fontFamily: ['"PT Sans", Tahoma, sans-serif'].join(","),
  },
  overrides: {
    MuiInputLabel: {
      root: {
        fontSize: 14,
      },
    },
    MuiOutlinedInput: {
      root: {
        "& fieldset": {
          borderRadius: `0`,
        },
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        color: "#fff",
      },
      containedPrimary: {
        color: "white",
        "&:hover": {
          cursor: "pointer",
          // backgroundColor: "#6dc0f9",
        },
      },
    },
    MuiTableCell: {
      root: {
        padding: 20,
      },
    },
  },
});

console.log("theme: ", theme);

export default theme;
