import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions/index";
import axios from "axios-instance";
import { useParams } from "react-router-dom";
import { Redirect } from "react-router-dom";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import { Box, Grid } from "@material-ui/core";

const Contractor = (props) => {
  const classes = useStyles();
  const { contractor, filters, contractorsFilters } = props;
  const { user } = useContext(SessionContext);
  const { contractorId } = useParams();

  const [name, setName] = useState(contractor.name);
  const [contactName, setContactName] = useState(contractor.contactName);
  const [email, setEmail] = useState(contractor.email);
  const [phoneNumber, setPhoneNumber] = useState(contractor.phoneNumber);
  const [description, setDescription] = useState(contractor.description);
  const [error, setError] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const handleContractorUpdate = (event) => {
    const contractor = {
      name,
      description,
      contactName,
      phoneNumber,
      email,
    };
    axios
      .put(`/contractor/${contractorId}`, contractor)
      .then((res) => {
        props.onFetchContractor(user.token, contractorId, filters);
        props.onFetchContractors(user.token, contractorsFilters);
      })
      .catch((error) => {
        setError(error);
      });
    props.setDrawerState(false);
  };

  const handleContractorDeletion = () => {
    axios
      .delete(`/contractor/${contractorId}`)
      .then((res) => {
        props.onFetchContractors(user.token, contractorsFilters);
        setRedirect(true);
        props.setDrawerState(false);
      })
      .catch((error) => {
        setError(error);
      });
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

  if (redirect) return <Redirect to={"/contractors"} />;

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Добавить нового контрагента
      </Typography>

      <form noValidate autoComplete="off">
        <div className={classes.row}>
          <TextField
            id="contractorName"
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
            id="contactName"
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
            id="contractorEmail"
            label="Электронная почта"
            required
            multiline
            rowsMax="1"
            value={email}
            onChange={(e) => handleChange(e, "email")}
            variant="outlined"
          />
          <TextField
            id="contractorPhoneNumber"
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
            id="contractorComment"
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
          <Grid container direction="row">
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleContractorUpdate}
            >
              Cохранить
            </Button>
            <Button
              onClick={handleContractorDeletion}
              className={classes.deleteButton}
              variant="contained"
            >
              Удалить
            </Button>
          </Grid>
        </Box>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    contractor: state.contractors.contractor.contractor,
    filters: state.contractors.contractor.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Contractor);
