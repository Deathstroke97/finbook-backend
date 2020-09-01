import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import axios from "axios-instance";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";

import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import { connect } from "react-redux";

const TransferWorker = (props) => {
  const classes = useStyles();
  const { accounts } = props;
  const [amount, setAmount] = useState();
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [error, setError] = useState(null);

  const handleDateChange = (date) => {
    setTransactionDate(date);
  };

  const handleAmountChange = (event) => {
    setAmount(String(event.target.value));
  };

  const handleOperationClick = (event) => {
    props.setDrawerState(false);
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name == "fromAccount") {
      setFromAccount(value);
    } else if (name == "toAccount") {
      setToAccount(value);
    } else {
      setDescription(value);
    }
  };

  // const handleTransferCreation = () => {
  //   const transfer = {
  //     exchangeRate: 1,
  //     amount,
  //     description,
  //     fromBankAccount: fromAccount,
  //     toBankAccount: toAccount,
  //     date: transactionDate,
  //   };
  //   axios
  //     .post("/transfer", transfer)
  //     .then((res) => {
  //       props.setDrawerState(false);
  //     })
  //     .catch((err) => {
  //       setError(err);
  //     });
  // };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Добавить перевод
      </Typography>

      <form noValidate autoComplete="off">
        <TextField
          autoFocus
          required
          value={amount > 0 ? amount : amount < 0 ? -1 * amount : amount}
          onChange={handleAmountChange}
          id="outlined-number"
          label="Сумма"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <div className={classes.row}>
          <TextField
            required
            id="outlined-select-currency"
            select
            label="Счет"
            value={fromAccount}
            onChange={(e) => handleChange(e, "fromAccount")}
            helperText=""
            variant="outlined"
          >
            {accounts.map((account) => (
              <MenuItem key={account._id} value={account._id}>
                {account.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            id="outlined-select-currency"
            select
            label="На счет"
            value={toAccount}
            onChange={(e) => handleChange(e, "toAccount")}
            helperText=""
            variant="outlined"
          >
            {accounts.map((account) => (
              <MenuItem key={account._id} value={account._id}>
                {account.name}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div className={classes.row}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container justify="space-around">
              <KeyboardDatePicker
                required
                style={{ marginTop: 4, width: "96%" }}
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Дата"
                value={transactionDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
          <TextField
            id="outlined-multiline-flexible"
            label="Описание"
            multiline
            rowsMax="4"
            value={description}
            onChange={(e) => handleChange(e, "description")}
            variant="outlined"
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          className={classes.addButton}
          onClick={handleOperationClick}
        >
          Добавить
        </Button>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts.accounts,
  };
};

export default connect(mapStateToProps, null)(TransferWorker);
