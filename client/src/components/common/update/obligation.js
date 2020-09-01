import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import { useStyles } from "./style";
import { activities, categories, types, groups } from "dummyData";
import constants from "constants/constants";
import moment from "moment";
import axios from "axios-instance";
import { useParams } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions";

import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import Drawer from "@material-ui/core/Drawer";
import TransferWorker from "components/home/OperationWorkers/transferWorker";
import Group from "./group";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

const Obligation = (props) => {
  const classes = useStyles();
  const { contractorId } = useParams();
  const { user } = useContext(SessionContext);

  const { obligation, filters, action, setDrawerState } = props;
  const obligationId = obligation._id;
  const disabled = obligation.transaction ? true : false;
  const [type, setType] = useState(obligation.type);
  const [amount, setAmount] = useState(obligation.amount);
  const [currency, setCurrency] = useState(obligation.currency);
  const [description, setDescription] = useState(obligation.description);
  const [date, setDate] = useState(obligation.date);
  const [error, setError] = useState(null);

  const handleObligationUpdate = (event) => {
    const obligation = {
      type,
      amount,
      currency,
      description,
      date,
    };
    axios
      .put(`/obligation/${obligationId}`, obligation, {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      })
      .then((res) => {
        props.onFetchContractors(user.token, props.filters);
        props.onFetchContractor(user.token, contractorId, props.filters);
        props.setDrawerState(false);
      })
      .catch((error) => {
        setError(error);
      });
    props.setDrawerState(false);
  };

  const handleObligationRemove = () => {
    axios
      .delete(`/obligation/${obligationId}`)
      .then((res) => {
        props.onFetchContractors(user.token, props.filters);
        props.onFetchContractor(user.token, contractorId, props.filters);
      })
      .catch((error) => {
        setError(error);
      });
    props.setDrawerState(false);
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    console.log("value: ", value);
    if (name === "type") {
      setType(value);
    }
    if (name == "description") {
      setDescription(value);
    }
    if (name === "amount") {
      setAmount(String(event.target.value));
    }
    if (name === "currency") {
      setCurrency(value);
    }
  };

  const handleAmountChange = (event) => {
    setAmount(String(event.target.value));
  };

  const handleDateChange = (value) => {
    const date = moment(value).format("YYYY-MM-DD");
    setDate(date);
  };

  console.log("obligation: ", obligation);
  return (
    <div className={classes.root}>
      <Box>
        <Typography className={classes.operationNameText}>
          Добавить новое обязательство
        </Typography>
        <div className={classes.row}>
          <FormControl component="fieldset">
            <RadioGroup
              disabled={disabled}
              row
              aria-label="type"
              name="type"
              value={type}
              onChange={(e) => handleChange(e, "type")}
            >
              <FormControlLabel
                value="in"
                control={<Radio color="primary" />}
                label="Получили от контрагента"
              />
              <FormControlLabel
                value="out"
                control={<Radio color="primary" />}
                label="Передали контрагенту"
              />
            </RadioGroup>
          </FormControl>
        </div>

        <form noValidate autoComplete="off">
          <div className={classes.row}>
            <TextField
              disabled={disabled}
              autoFocus
              required
              value={amount}
              onChange={handleAmountChange}
              id="outlined-number"
              label="Сумма"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              classes={{
                root: classes.textFieldRoot,
              }}
            />
            <TextField
              disabled={disabled}
              required
              id="outlined-select-currency"
              select
              label="Валюта"
              value={currency}
              onChange={(e) => handleChange(e, "currency")}
              helperText=""
              variant="outlined"
            >
              {constants.currencies.map((currency) => (
                <MenuItem key={currency.value} value={currency.value}>
                  {currency.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className={classes.row}>
            <TextField
              disabled={disabled}
              id="outlined-multiline-flexible"
              label="Описание"
              required
              multiline
              rowsMax="1"
              value={description}
              onChange={(e) => handleChange(e, "description")}
              variant="outlined"
            />

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid container justify="space-around">
                <KeyboardDatePicker
                  disabled={disabled}
                  required
                  style={{ marginTop: 4, width: "96%" }}
                  disableToolbar
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Дата"
                  value={date}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </Grid>
            </MuiPickersUtilsProvider>
          </div>
          <Box mt={1}>
            {disabled && (
              <Typography variant="subtitle2">
                Обязательство, созданное автоматически на основании операции, не
                может быть отредактировано или удалено.
              </Typography>
            )}
          </Box>
          <Box mt={1}>
            <Grid direction="row">
              <Button
                disabled={disabled}
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleObligationUpdate}
              >
                Сохранить
              </Button>
              <Button
                disabled={disabled}
                variant="contained"
                color="error"
                className={classes.deleteButton}
                onClick={handleObligationRemove}
              >
                Удалить
              </Button>
            </Grid>
          </Box>
        </form>
      </Box>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    filters: state.contractors.contractor.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Obligation);
