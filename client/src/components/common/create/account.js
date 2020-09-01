import React, { useState, useContext } from "react";
import axios from "axios-instance";
import { useLocation } from "react-router-dom";
import * as actions from "store/actions";
import { connect } from "react-redux";
import moment from "moment";
import constants from "constants/constants";
import { useHistory } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import MenuItem from "@material-ui/core/MenuItem";
import { currencies } from "dummyData";
import { Box } from "@material-ui/core";
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

const Account = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  let location = useLocation();
  console.log("pathName: ", location.pathname);
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState(null);
  const [currency, setCurrency] = useState("KZT");
  const [bik, setBik] = useState(null);
  const [bankNumber, setBankNumber] = useState(null);
  const [hasInitialBalance, setInitialBalanceState] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialBalanceDate, setInitialBalanceDate] = useState(moment());

  const [error, setError] = useState(null);

  const checkValidity = () => {
    if (name) return true;
    else return false;
  };

  const handleAccountCreation = (event) => {
    if (!checkValidity()) {
      return;
    }
    const account = {
      name,
      bankName,
      currency,
      bik,
      bankNumber,
      type: constants.ACCOUNT,
      initialBalance,
      initialBalanceDate: moment(initialBalanceDate).format("YYYY-MM-DD"),
    };
    axios
      .post("/account", account)
      .then((res) => {
        props.setDrawerState(false);
        props.onFetchAccounts(user.token);
        if (location.pathname !== "/settings") {
          props.onFetchTransactions(user.token, props.filters);
        }
      })
      .catch((error) => setError(error));
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name === "name") {
      setName(value);
    } else if (name === "bankName") {
      setBankName(value);
    } else if (name === "currency") {
      setCurrency(value);
    } else if (name === "bankNumber") {
      setBankNumber(value);
    } else if (name === "initialBalance") {
      setInitialBalance(value);
    } else {
      setBik(value);
    }
  };

  const handleDateChange = (value) => {
    const date = moment(value).format("YYYY-MM-DD");
    setInitialBalanceDate(date);
  };

  const handleCheckBoxChange = () => {
    setInitialBalanceState(!hasInitialBalance);
    setInitialBalanceDate(moment());
    setInitialBalance(0);
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Добавить новый банковский счет
      </Typography>

      <form noValidate autoComplete="off">
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Название счета"
            error={name === ""}
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
            id="outlined-multiline-flexible"
            label="Банк"
            multiline
            rowsMax="1"
            value={bankName}
            onChange={(e) => handleChange(e, "bankName")}
            variant="outlined"
          />

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

        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="БИК"
            multiline
            rowsMax="1"
            value={bik}
            onChange={(e) => handleChange(e, "bik")}
            variant="outlined"
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Номер счета"
            multiline
            rowsMax="1"
            value={bankNumber}
            onChange={(e) => handleChange(e, "bankNumber")}
            variant="outlined"
          />
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
            onClick={handleAccountCreation}
          >
            Добавить
          </Button>{" "}
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

export default connect(mapStateToProps, mapDispatchToProps)(Account);
