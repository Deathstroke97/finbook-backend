import React, { useState, useContext, useEffect } from "react";
import { SessionContext } from "context/SessionContext";
import {
  makeStyles,
  Typography,
  Box,
  Button,
  withStyles,
} from "@material-ui/core";
import moment from "moment";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Divider from "@material-ui/core/Divider";
import { splitByThree, isBusinessActive } from "utils/functions";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CheckIcon from "@material-ui/icons/Check";

const benefits = [
  "Существенное сокращение времени на учёт",
  "Неограниченное количество счетов",
  "Неограниченное количество пользователей",
  "Учёт по проектам и направлениям",
  "Аналитика по контрагентам",
  "Финансовое планирование",
  "Простые и понятные отчёты",
  // "Интеграция с банками",
  "Авто-распределение операций по статьям",
  // "Еженедельные отчёты на почту",
  // "Telegram-бот для упрощения учёта",
  // "Поддержка различных валют",
  // "Полезные материалы об учёте на почту",
  // "Техподдержка в чате и почте",
];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
  },
  right: {
    display: "flex",
    width: "65%",
    flexDirection: "column",
  },
  left: {
    marginTop: theme.spacing(10),
    marginRight: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    "& > div": {
      display: "flex",
      "& p": {
        fontSize: 14,
        fontStyle: "italic",
        color: "#333",
      },
    },
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(3, 0),
  },
  tariffName: {
    fontSize: 27,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(2),
  },
  benefitText: {
    fontSize: 14,
    color: theme.palette.grey[900],
    marginBottom: theme.spacing(2),
  },
  formControlLabel: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: "uppercase",
  },
  radio: {
    padding: 5,
    "& span": {
      color: "rgb(101, 84, 171)",
    },
  },
  greyText: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.grey[600],
    textTransform: "uppercase",
  },
  priceCurrent: {
    fontSize: 27,
    marginRight: theme.spacing(3),
  },
  priceOld: {
    fontSize: 27,
    textDecoration: "line-through",
    color: "#626262",
    marginRight: theme.spacing(3),
  },
  maxBenefitText: {
    color: theme.palette.success.main,
    textTransform: "uppercase",
    fontSize: 14,
    fontWeight: theme.typography.fontWeightBold,
  },
  finbookAvailability: {
    fontSize: 14,
  },
  payButton: {
    background: theme.palette.success.main,
    color: theme.palette.common.white,
    padding: "10px 18px",
    "&:hover": {
      background: theme.palette.success.light,
    },
    "& svg": {
      marginRight: 7,
    },
  },
  checkIcon: {
    color: theme.palette.success.main,
    fontWeight: theme.typography.fontWeightBold,
    marginRight: 5,
  },
  mainText: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

const PayFinbook = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const [subscription, setSubscription] = useState("12");
  const [paymentOption, setPaymentOption] = useState("bankCard");
  const [price, setPrice] = useState({ current: 14990, old: 23880 });
  const business = user.business;
  const activationEndDate = moment(business.activationEndDate).format(
    "DD/MM/YYYY"
  );

  const handleChange = (event, name) => {
    const value = event.target.value;

    if (name == "subscription") {
      setSubscription(value);
      if (value == "1") setPrice({ current: 1990, old: 0 });
      if (value == "3") setPrice({ current: 4990, old: 5970 });
      if (value == "6") setPrice({ current: 8990, old: 11940 });
      if (value == "12") setPrice({ current: 14990, old: 23880 });
    }
    if (name == "paymentOption") {
      setPaymentOption(value);
    }
  };

  let finbookAvailabilityText = null;
  if (!isBusinessActive(user)) {
    finbookAvailabilityText = (
      <p className={classes.finbookAvailability}>
        <span className={classes.mainText}>Cрок дейтсвия подписки истек. </span>
        Пожалуйста свяжитесь с администратором для активации вашего аккаунта.
        <br />
        Ваш персональный администратор по сервису: Арман Сериков, +7 775 505
        9153
      </p>
    );
  }
  if (isBusinessActive(user)) {
    finbookAvailabilityText = (
      <p className={classes.finbookAvailability}>
        <span className={classes.mainText}>
          Finbook доступен до {activationEndDate}.
        </span>
        <br />
        Ваш персональный администратор по сервису: Арман Сериков, +7 775 505
        9153
      </p>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.right}>
        <Box>
          <p className={classes.tariffName}>Тариф «Максимальный»</p>
          <p className={classes.benefitText}>
            Использование Finbook позволит вам в несколько раз сократить время,
            которое вы тратите на учёт. Кроме этого, 75% наших клиентов находят
            статьи для оптимизации расходов уже на второй месяц пользования
            сервисом. И таким образом сразу окупают подписку
          </p>
        </Box>
        {/* <div className={classes.row}>
          <Typography className={classes.greyText}>Срок подписки</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              aria-label="subscription"
              name="subscription"
              value={subscription}
              onChange={(e) => handleChange(e, "subscription")}
            >
              <FormControlLabel
                value="1"
                control={
                  <Radio color="primary" classes={{ root: classes.radio }} />
                }
                label="1 месяц"
                classes={{
                  label: classes.formControlLabel,
                }}
              />
              <FormControlLabel
                value="3"
                control={
                  <Radio color="primary" classes={{ root: classes.radio }} />
                }
                label="3 месяца"
                classes={{
                  label: classes.formControlLabel,
                }}
              />
              <FormControlLabel
                value="6"
                control={
                  <Radio color="primary" classes={{ root: classes.radio }} />
                }
                label="6 месяцев"
                classes={{
                  label: classes.formControlLabel,
                }}
              />
              <FormControlLabel
                value="12"
                control={
                  <Radio color="primary" classes={{ root: classes.radio }} />
                }
                label="12 месяцев"
                classes={{
                  label: classes.formControlLabel,
                }}
              />
            </RadioGroup>
          </FormControl>
        </div> */}
        <Divider />
        {/* <div className={classes.row}>
          <Typography className={classes.greyText}>Вариант оплаты</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              aria-label="paymentOption"
              name="paymentOption"
              value={paymentOption}
              onChange={e => handleChange(e, "paymentOption")}
            >
              <FormControlLabel
                value="bankCard"
                control={
                  <Radio color="primary" classes={{ root: classes.radio }} />
                }
                label="С бансковской карты"
                classes={{
                  label: classes.formControlLabel
                }}
              />
              <FormControlLabel
                value="companyAccount"
                control={
                  <Radio color="primary" classes={{ root: classes.radio }} />
                }
                label="С расчетного счета компании"
                classes={{
                  label: classes.formControlLabel
                }}
              />
            </RadioGroup>
          </FormControl>
        </div> */}
        {/* <Divider />
        <Box display="flex" pt={3} pb={3} alignItems="center">
          <p className={classes.priceCurrent}>
            {splitByThree(price.current) + " P"}
          </p>
          {price.old != "0" && (
            <p className={classes.priceOld}>{splitByThree(price.old) + " P"}</p>
          )}
          {subscription == "12" && (
            <p className={classes.maxBenefitText}>-Максимальная выгода</p>
          )}
        </Box> */}
        <Divider />
        <div className={classes.row}>
          {/* <p className={classes.finbookAvailability}>
            Finbook доступен до 12.03.2020. После оплаты доступ будет продлен до
            12.03.2021.
          </p> */}
          {finbookAvailabilityText}
        </div>
        <Divider />
        {/* <Box pt={3}>
          <Button
            variant="contained"
            classes={{ root: classes.payButton, label: classes.payButtonLabel }}
          >
            <ArrowForwardIcon fontSize="small" />
            Перейти к оплате
          </Button>
        </Box> */}
      </div>
      <div className={classes.left}>
        {benefits.map((benefit, index) => (
          <div key={index}>
            <CheckIcon classes={{ root: classes.checkIcon }} />
            <p>{benefit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayFinbook;
