import React from "react";
import {
  Container,
  Grid,
  Box,
  makeStyles,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import { cards } from "utils/dummyData";
import Card from "./Card";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "rgb(244, 247, 249)",
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  mainText: {
    fontWeight: theme.typography.fontWeightBold,
  },
  subText: {
    fontSize: 20,
    lineHeight: 1.8,
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const Abilities = (props) => {
  const classes = useStyles();
  return (
    <section className={classes.root}>
      <Box pt={20} pb={20}>
        <Grid container justify="space-around">
          <Grid item xs={12} sm={5}>
            <Typography
              variant="h3"
              className={clsx(classes.marginBottom, classes.mainText)}
            >
              Что ещё умеет FinBook?
            </Typography>
            <Typography className={classes.subText}>
              FinBook создан для того, чтобы сделать учёт в вашем бизнесе проще.
              Возьмите под контроль цифры и принимайте решения
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Container>
        <Grid
          container
          style={{ marginBottom: "400px", justifyContent: "space-around" }}
        >
          {cards.map((card, index) => (
            <Card card={card} key={index} />
          ))}
        </Grid>
      </Container>
    </section>
  );
};

export default Abilities;
