import React from "react";
import Navbar from "../../components/landing/Navbar";
import { Container, makeStyles, Box } from "@material-ui/core";
import MainSection from "./MainSection";
import SecondSection from "./SecondSection";
import Abilities from "./Abilities";
import ClientResponses from "./ClientResponses";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "center"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "80%",
    marginTop: theme.spacing(25),

    "@media (max-width:1100px)": {
      marginTop: "400px",
      fontSize: "10px",
      width: "100%",
      marginRight: "20px",
      marginLeft: "20px"
    }
  }
}));

const Landing = () => {
  const classes = useStyles();
  return (
    <>
      <Navbar />
      <div className={classes.root}>
        <div className={classes.container}>
          <MainSection />
        </div>
      </div>
      <Container>
        <SecondSection />
      </Container>
      <ClientResponses />
      <Abilities />
    </>
  );
};

export default Landing;
