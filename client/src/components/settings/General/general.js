import React, { useState, useContext } from "react";
import axios from "axios-instance";
import { makeStyles, Typography, Box } from "@material-ui/core";
import { SessionContext } from "context/SessionContext";

import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useStyles } from "./style";
import constants from "constants/constants";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";

const General = (props) => {
  const classes = useStyles();
  const context = useContext(SessionContext);
  const { user, setUserData } = useContext(SessionContext);
  const [currency, setCurrency] = useState(user.business.currency);
  const [name, setName] = useState(user.business.name);
  const [error, setError] = useState(null);

  const handleBusinessNameChange = (e) => {
    const name = e.target.value;
    setName(name);
  };

  const handleCurrencyChange = (e) => {
    const currency = e.target.value;
    setCurrency(currency);
  };

  const handleSaveAction = () => {
    const business = {
      name,
      currency,
    };
    axios
      .put("/business", business)
      .then((res) => {
        const business = res.data.business;
        const user = res.data.user;
        setName(business.name);
        setCurrency(business.currency);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("business", JSON.stringify(business));

        setUserData({
          ...context.user,
          user: user,
          business,
        });
      })
      .catch((err) => setError(err));
  };

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Typography>Название компании</Typography>
        <Box height="75%">
          <TextField
            id="outlined-multiline-flexible"
            error={!name}
            // label="Название компании"
            InputProps={{ disableUnderline: true }}
            multiline
            rowsMax="1"
            value={name}
            onChange={handleBusinessNameChange}
            variant="outlined"
            classes={{
              root: classes.inputRoot,
              label: classes.inputLabel,
            }}
            size="small"
          />
        </Box>
      </div>
      <div className={classes.row}>
        <Typography>Валюта</Typography>
        <TextField
          required
          id="outlined-select-currency"
          select
          label="Валюта"
          value={currency}
          onChange={handleCurrencyChange}
          helperText=""
          variant="outlined"
          classes={{
            root: classes.inputRoot,
          }}
          size="small"
        >
          {constants.currencies.map((option) => (
            <MenuItem
              className="MenuItem"
              key={option.value}
              value={option.value}
              classes={{
                root: classes.menuItem,
                selected: classes.menuItemSelected,
              }}
              style={{ fontSize: 13 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className={classes.row}>
        <Box justifyContent="flex-end" width={"100%"} display="flex">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleSaveAction}
            disabled={!name}
          >
            Cохранить
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default General;
