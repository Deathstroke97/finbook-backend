import React from "react";
import { Grid, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(4),
    backgroundColor: "white",
    boxShadow: "0px 0px 5px -1px rgba(0,0,0,0.2)",
    borderRadius: "7px",
    margin: "20px 20px",
    width: "360px",
    height: "400px",
    marginBottom: "50px",
    [theme.breakpoints.down("sm")]: {
      height: "auto"
    }
  },
  cardHeaderText: {
    fontSize: "22px",
    lineHeight: 1.35,
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: "15px"
  },
  cardBodyText: {
    fontSize: "18px",
    lineHeight: 1.55,
    fontWeight: theme.typography.fontWeightLight
  },
  cardImage: {
    marginBottom: theme.spacing(7)
  }
}));

const Card = ({ card }) => {
  const { cardHeaderText, cardBodyText, cardImage } = card;
  const classes = useStyles();
  return (
    <div className={classes.card}>
      <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="flex-start"
      >
        <Grid item className={classes.cardImage}>
          <img src={cardImage} width="60" height="60"></img>
        </Grid>
        <Grid item>
          <Typography className={classes.cardHeaderText}>
            {cardHeaderText}
          </Typography>
          <Typography className={classes.cardBodyText}>
            {cardBodyText}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default Card;
