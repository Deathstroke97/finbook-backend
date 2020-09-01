import React from "react";
import { Grid, Box, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  image: {
    height: "100%",
    width: "100%",
    objectFit: "cover"
  },
  right: {
    backgroundColor: "#051b35",
    color: theme.palette.common.white
  },
  mainText: {
    fontWeight: theme.typography.fontWeightBold,
    fontSize: "34px",
    [theme.breakpoints.down("sm")]: {
      fontSize: "22px"
    }
  },
  subText: {
    fontSize: "20px",
    marginBottom: theme.spacing(4),
    lineHeight: "30px",
    fontWeight: theme.typography.fontWeightRegular,
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
      lineHeight: "1.5"
    }
  }
}));

const ClientResponses = props => {
  const classes = useStyles();
  return (
    <div>
      <Grid container style={{ height: "647px" }}>
        <Grid item xs={12} sm={6}>
          <img src="/images/client.jpg" className={classes.image} />
        </Grid>
        <Grid item className={classes.right} xs={12} sm={6}>
          <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: "100%" }}
          >
            <Grid item xs={10}>
              <Typography gutterBottom className={classes.mainText}>
                «Finbook действительно помог нам начать зарабатывать больше»
              </Typography>
              <Typography gutterBottom className={classes.subText}>
                Внедрили сервис в свою компанию: разработка digital-продуктов,
                30 человек в штате. Получили возможность удобно вести учёт по
                проектам, сильно сократив время, которое тратили на это раньше.
              </Typography>
              <Typography>Степан Родионов Antida software</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default ClientResponses;
