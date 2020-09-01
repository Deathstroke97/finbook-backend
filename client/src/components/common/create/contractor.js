import React, { useState, useContext } from "react";
import axios from "axios-instance";
import * as actions from "store/actions";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import { Box } from "@material-ui/core";

const Contractor = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { contractorId } = useParams();
  const { user } = useContext(SessionContext);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  const handleContractorCreation = (event) => {
    const contractor = {
      name,
      contactName,
      email,
      phoneNumber,
      description,
    };
    axios
      .post("/contractor", contractor)
      .then((res) => {
        props.setDrawerState(false);
        props.onFetchContractors(user.token, props.contractorsFilters);
        if (contractorId) {
          const contractor = res.data.contractor;
          history.push(`/contractors/${contractor._id}`);
        }
      })
      .catch((error) => setError(error));
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name == "name") {
      setName(value);
    } else if (name == "contactName") {
      setContactName(value);
    } else if (name == "email") {
      setEmail(value);
    } else if (name == "phoneNumber") {
      setPhoneNumber(value);
    } else {
      setDescription(value);
    }
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Добавить нового контрагента
      </Typography>

      <form noValidate autoComplete="off">
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Название"
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
            label="Контактное лицо"
            required
            multiline
            rowsMax="1"
            value={contactName}
            onChange={(e) => handleChange(e, "contactName")}
            variant="outlined"
          />
        </div>
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Электронная почта"
            required
            multiline
            rowsMax="1"
            value={email}
            onChange={(e) => handleChange(e, "email")}
            variant="outlined"
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Номер телефона"
            required
            multiline
            rowsMax="1"
            value={phoneNumber}
            onChange={(e) => handleChange(e, "phoneNumber")}
            variant="outlined"
          />
        </div>
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Комментарии"
            required
            multiline
            rowsMax="1"
            value={description}
            onChange={(e) => handleChange(e, "description")}
            variant="outlined"
          />
        </div>
        <Box mt={1}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleContractorCreation}
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
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
  };
};

export default connect(null, mapDispatchToProps)(Contractor);
