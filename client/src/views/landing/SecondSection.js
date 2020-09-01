import React from "react";
import { Grid, Box, Typography, makeStyles, Button } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  mainText: {
    fontWeight: 400
  },
  spacing: {
    marginBottom: theme.spacing(3)
  }
}));

const SecondSection = () => {
  const classes = useStyles();
  return (
    <>
      <Box mt={10} />
      <Grid container direction="column">
        <Grid item container justify="space-around">
          <Grid item xs={12} sm={5}>
            <img
              src="/images/landing2.svg"
              style={{ objectFit: "contain" }}
            ></img>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Box mt={5}>
              <Grid item container direction="column" justify="center">
                <Typography
                  variant="h4"
                  className={clsx(classes.mainText, classes.spacing)}
                >
                  Ключевые бизнес-отчёты в реальном времени
                </Typography>

                <Typography className={clsx(classes.spacing)}>
                  Отчёты — это почва для принятия решений. FinBook будет в
                  реальном времени считать рентабельность вашего бизнеса, его
                  прибыльность и другие важные показатели.
                </Typography>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        <Box mt={10} />
        <Grid item container justify="space-around">
          <Grid item xs={12} sm={5}>
            <Box mt={5}>
              <Grid item container direction="column" justify="center">
                <Typography
                  variant="h4"
                  className={clsx(classes.mainText, classes.spacing)}
                >
                  Прогнозирование кассовых разрывов
                </Typography>

                <Typography className={classes.spacing}>
                  Пользуйтесь встроенным инструментом финансового планирования,
                  создавая операции на будущее. FinBook спрогнозирует финансовый
                  поток и сможет визуально отобразить кассовый разрыв.
                </Typography>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} sm={5}>
            <img
              src="/images/landing3.svg"
              style={{ objectFit: "contain" }}
            ></img>
          </Grid>
        </Grid>
        <Box mt={10} />
        <Grid item container justify="space-around">
          <Grid item xs={12} sm={5}>
            <img
              src="/images/landing4.svg"
              style={{ objectFit: "contain" }}
            ></img>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Box mt={5}>
              <Grid item container direction="column" justify="center">
                <Typography
                  variant="h4"
                  className={clsx(classes.mainText, classes.spacing)}
                >
                  Учёт по проектам и направлениям
                </Typography>

                <Typography className={classes.spacing}>
                  В FinBook вы сможете легко распределить общий денежный поток
                  по разным проектам и в реальном времени видеть их прибыльность
                  и рентабельность.
                </Typography>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        <Box mt={10} />
      </Grid>
    </>
  );
};
export default SecondSection;
