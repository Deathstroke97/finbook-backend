import React from "react";
import { Grid, Box, makeStyles, Typography, Button } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  mainText: {
    fontWeight: 700,
    [theme.breakpoints.down("sm")]: {
      fontSize: "18px"
    }
  },
  button: {
    padding: theme.spacing(2),
    width: "75%",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: "20px auto"
    },
    fontSize: 18
  },
  mainBox: {
    marginTop: theme.spacing(12),
    [theme.breakpoints.down("sm")]: {
      marginTop: 0
    }
  },
  spacing: {
    marginBottom: theme.spacing(3)
  }
}));

const MainSection = () => {
  const classes = useStyles();
  return (
    <Grid container direction="row">
      <Grid item xs={12} sm={5}>
        <Box mt={5}>
          <Grid item container direction="column" justify="center">
            <Typography
              variant="h4"
              className={clsx(classes.mainText, classes.spacing)}
            >
              Удобный Управленческий учёт для малого бизнеса
            </Typography>

            <Typography className={classes.spacing}>
              Избавьтесь от бардака в учёте денег. Теперь финансы вашей компании
              будут разложены по полочкам, а вы сможете освободить время для
              более важных вещей.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Протестировать бесплатно на 14 дней
            </Button>
          </Grid>
        </Box>
      </Grid>
      <Grid item xs={12} sm={7}>
        <Box>
          <img
            src="/images/landing1.svg"
            style={{ objectFit: "contain" }}
          ></img>
        </Box>
      </Grid>
    </Grid>
  );
};

export default MainSection;
