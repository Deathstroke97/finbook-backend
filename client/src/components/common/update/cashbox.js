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
import MenuItem from "@material-ui/core/MenuItem";
import { Box } from "@material-ui/core";

import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { currencies } from "dummyData";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const Cashbox = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { cashbox } = props;
  const cashboxId = cashbox._id;

  const [name, setName] = useState(cashbox.name);
  const [currency, setCurrency] = useState("KZT");
  const [hasInitialBalance, setInitialBalanceState] = useState(
    +cashbox.initialBalance !== 0
  );
  const [initialBalance, setInitialBalance] = useState(+cashbox.initialBalance);
  const [initialBalanceDate, setInitialBalanceDate] = useState(
    moment(cashbox.initialBalanceDate)
  );

  const [error, setError] = useState(null);

  const handleCashboxUpdate = (event) => {
    const cashbox = {
      name,
      bankName: null,
      bik: null,
      bankNumber: null,
      currency,
      initialBalance,
      initialBalanceDate,
    };
    axios
      .put(`/account/${cashboxId}`, cashbox)
      .then((res) => {
        props.setDrawerState(false);
        props.onFetchAccounts(user.token);
      })
      .catch((error) => setError(error));
  };

  const handleCashboxDeletion = () => {
    axios
      .delete(`/account/${cashboxId}`)
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
    setInitialBalanceDate(moment());
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Наличный счет или касса
      </Typography>

      <form noValidate autoComplete="off">
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Название счета"
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
          <div className={classes.row}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleCashboxUpdate}
            >
              Сохранить
            </Button>
            <Button
              variant="contained"
              className={classes.deleteButton}
              onClick={handleCashboxDeletion}
            >
              Удалить
            </Button>
          </div>
        </Box>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    filters: state.transactions.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchAccounts: (token) => dispatch(actions.fetchAccounts(token)),
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Cashbox);
