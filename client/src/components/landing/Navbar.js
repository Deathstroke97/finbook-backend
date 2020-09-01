import React, { useState, useContext } from "react";
import axios from "axios-instance";
import { connect } from "react-redux";
import { SessionContext } from "../../context/SessionContext";
import * as actions from "store/actions";
import { Grid, Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import { CustomButton } from "./style";
import { useStyles } from "./Navbar.style";
import { makeStyles } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const Navbar = (props) => {
  const classes = useStyles();
  const { user, setUserData } = useContext(SessionContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [action, setAction] = useState("");
  const [open, setOpen] = React.useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    console.log("email: ", email);
    console.log("password: ", password);
    //loading: true
    // const res = await fetch("http://192.168.1.67:8081/auth/login", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     email: email,
    //     password: password,
    //   }),
    // });

    // if (res.status === 422) {
    //   throw new Error("Validation failed.");
    // }
    // if (res.status !== 200 && res.status !== 201) {
    //   console.log("Error!");
    //   throw new Error("Could not authenticate you!");

    // const response = await res.json();
    // console.log("response: ", response);
    // setUserData(response);
    axios
      .post("/auth/login", { email: email, password: password })
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => {
        setError(err);
      });
  };

  const handleSignUp = () => {
    const user = {
      email,
      name,
      businessName,
      password,
    };
    axios
      .post("/auth/signup", user)
      .then((res) => {
        handleLogin();
      })
      .catch((err) => {
        setError(err);
      });
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "businessName") {
      setBusinessName(value);
    } else if (name === "name") {
      setName(value);
    }
  };

  const handleClick = (action) => {
    setAction(action);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  let dialog = (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      classes={{
        scrollPaper: classes.scrollPaper,
        paper: classes.paper,
      }}
    >
      <DialogTitle id="form-dialog-title">Вход в аккаунт Finbook</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText> */}

        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleChange(e, "email")}
          fullWidth
        />
        <TextField
          margin="dense"
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => handleChange(e, "password")}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Закрыть
        </Button>
        <Button onClick={handleLogin} color="primary">
          Войти
        </Button>
      </DialogActions>
    </Dialog>
  );
  if (action === "singup") {
    dialog = (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        classes={{ scrollPaper: classes.scrollPaper }}
      >
        <DialogTitle id="form-dialog-title">
          <p className={classes.dialogTitle}>Попробуйте Finbook бесплатно</p>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            classes={{
              root: classes.dialogContentText,
            }}
          >
            Полнофункциональная версия для неограниченного количества
            пользователей абсолютно бесплатно на 7 дней.
          </DialogContentText>
          <div className={classes.marginTextField}>
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="Электронная почта"
              type="email"
              value={email}
              onChange={(e) => handleChange(e, "email")}
              fullWidth
            />
            <TextField
              margin="dense"
              id="name"
              label="Ваше иия"
              fullWidth
              value={name}
              onChange={(e) => handleChange(e, "name")}
            />
            <TextField
              margin="dense"
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => handleChange(e, "password")}
              fullWidth
            />
            <TextField
              margin="dense"
              id="businessName"
              label="Название компании"
              value={businessName}
              onChange={(e) => handleChange(e, "businessName")}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions style={{ marginBottom: 15, marginRight: 15 }}>
          <Button onClick={handleSignUp} color="primary">
            Зарегистрироваться
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.navbar}>
        <Grid container direction="row" alignItems="center">
          <Grid item className={classes.left}>
            <Typography className={classes.brandName}>Finbook</Typography>
          </Grid>

          <Grid item className={classes.right}>
            <Typography
              className={classes.link}
              onClick={() => handleClick("login")}
            >
              Войти
            </Typography>
            <Typography
              className={classes.link}
              onClick={() => handleClick("singup")}
            >
              Регистрация
            </Typography>
          </Grid>
          {dialog}
        </Grid>
      </div>
    </div>
  );
};

export default Navbar;
