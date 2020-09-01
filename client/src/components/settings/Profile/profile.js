import React, { useState, useContext } from "react";
import { SessionContext } from "context/SessionContext";
import axios from "axios-instance";
import { makeStyles, Typography, Box } from "@material-ui/core";
import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useStyles } from "./style";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";

const Profile = (props) => {
  const classes = useStyles();
  const context = useContext(SessionContext);
  console.log("context in general: ", context);
  const { user, setUserData } = useContext(SessionContext);
  const [email, setEmail] = useState(user.user.email);
  const [name, setName] = useState(user.user.name);
  const [mobileNumber, setMobileNumber] = useState(user.user.mobileNumber);
  const [error, setError] = useState(null);

  const [requiredFieldsState, setRequiredFieldsState] = useState({
    email: true,
    name: true,
  });

  const checkValidity = () => {
    const isNotEmpty = email !== "" && name !== "";
    let updatedReqFields = requiredFieldsState;
    if (email === "") {
      updatedReqFields = {
        ...updatedReqFields,
        email: false,
      };
    }
    if (name === "") {
      updatedReqFields = {
        ...updatedReqFields,
        name: false,
      };
    }
    setRequiredFieldsState(updatedReqFields);
    return isNotEmpty;
  };

  const handleSaveButton = () => {
    if (checkValidity() === false) {
      return;
    }
    const user = {
      name,
      email,
      mobileNumber,
    };
    axios
      .put("/user", user)
      .then((res) => {
        const user = res.data.user;
        setName(user.name);
        localStorage.setItem("user", JSON.stringify(user));
        setUserData({
          ...context.user,
          user: user,
        });
      })
      .catch((err) => setError(err));
  };

  const handleChange = (e, name) => {
    const value = e.target.value;
    if (name === "email") {
      setEmail(value);
      if (value.trim() !== "") {
        setRequiredFieldsState({
          ...requiredFieldsState,
          email: true,
        });
      }
    } else if (name === "name") {
      setName(value);
      if (value.trim() !== "") {
        setRequiredFieldsState({
          ...requiredFieldsState,
          name: true,
        });
      }
    } else {
      setMobileNumber(value);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Typography>Электронная почта</Typography>
        <Box height="75%">
          <TextField
            id="outlined-multiline-flexible"
            label="E-mail"
            error={requiredFieldsState["email"] === false}
            multiline
            rowsMax="1"
            value={email}
            onChange={(e) => handleChange(e, "email")}
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
        <Typography>Имя и Фамилия</Typography>
        <Box height="75%">
          <TextField
            id="outlined-multiline-flexible"
            error={requiredFieldsState["name"] === false}
            label="Представьтесь, пожалуйста"
            multiline
            rowsMax="1"
            value={name}
            onChange={(e) => handleChange(e, "name")}
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
        <Typography>Телефонный номер</Typography>
        <Box height="75%">
          <TextField
            id="outlined-multiline-flexible"
            label="Тел.номер"
            multiline
            rowsMax="1"
            value={mobileNumber}
            onChange={(e) => handleChange(e, "mobileNumber")}
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
        <Box justifyContent="flex-end" width={"100%"} display="flex">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleSaveButton}
          >
            Cохранить
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Profile;
