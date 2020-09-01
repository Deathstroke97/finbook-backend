import React, { useState, useContext } from "react";
import axios from "axios-instance";
import * as actions from "store/actions";
import { connect } from "react-redux";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import { Box } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import { currencies } from "dummyData";
import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const Cashbox = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("KZT");
  const [hasInitialBalance, setInitialBalanceState] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialBalanceDate, setInitialBalanceDate] = useState(moment());
  const [error, setError] = useState(null);

  const handleCashboxCreation = (event) => {
    const cashbox = {
      bankName: null,
      bik: null,
      bankNumber: null,
      name,
      currency,
      initialBalance,
      initialBalanceDate,
      type: "cashbox",
    };
    axios
      .post("/account", cashbox)
      .then((res) => {
        props.setDrawerState(false);
        props.onFetchAccounts(user.token);
      })
      .catch((error) => setError(error));
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name === "name") {
      setName(value);
    } else if (name === "currency") {
      setCurrency(value);
    } else if (name === "initialBalance") {
      setInitialBalance(value);
    }
  };

  const handleDateChange = (value) => {
    const date = moment(value).format("YYYY-MM-DD");
    setInitialBalanceDate(date);
  };

  const handleCheckBoxChange = () => {
    setInitialBalanceState(!hasInitialBalance);
    setInitialBalanceDate(moment().format("YYYY-MM-DD"));
    setInitialBalance(0);
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Добавить новый наличный счет или кассу
      </Typography>

      <form noValidate autoComplete="off">
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Название счета или кассы"
            required
            multiline
            rowsMax="1"
            value={name}
            onChange={(e) => handleChange(e, "name")}
            variant="outlined"
          />
        </div>
        <div className={classes.row}>
          <TextField
            id="outlined-select-currency"
            select
            label="Валюта"
            required
            multiline
            rowsMax="1"
            value={currency}
            onChange={(e) => handleChange(e, "currency")}
            variant="outlined"
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.value} value={currency.value}>
                {currency.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              checked={hasInitialBalance}
              onChange={handleCheckBoxChange}
              value="initialBalance"
              color="primary"
            />
          }
          label="Указать начальный остаток счета"
          classes={{
            root: classes.rootLable,
            label: classes.label,
          }}
        />
        {hasInitialBalance ? (
          <div className={classes.row}>
            <TextField
              autoFocus
              value={initialBalance}
              onChange={(e) => handleChange(e, "initialBalance")}
              id="outlined-number"
              label="Начальный остаток"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              classes={{
                root: classes.textFieldRoot,
              }}
            />

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid container justify="flex-start">
                <KeyboardDatePicker
                  required
                  style={{ marginTop: 4 }}
                  disableToolbar
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Дата"
                  value={initialBalanceDate}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </Grid>
            </MuiPickersUtilsProvider>
          </div>
        ) : null}
        <Box mt={1}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleCashboxCreation}
          >
            Добавить
          </Button>{" "}
        </Box>
      </form>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchAccounts: (token) => dispatch(actions.fetchAccounts(token)),
  };
};

export default connect(null, mapDispatchToProps)(Cashbox);
