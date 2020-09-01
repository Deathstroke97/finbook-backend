import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { SessionContext } from "context/SessionContext";
import { connect } from "react-redux";
import * as actions from "store/actions";
import axios from "axios-instance";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import { Box } from "@material-ui/core";
import { useParams } from "react-router-dom";

const Project = (props) => {
  const classes = useStyles();
  const { editing } = props;
  const history = useHistory();
  const { user } = useContext(SessionContext);
  const { projectId } = useParams();
  const [name, setName] = useState();
  const [description, setDescription] = useState("");
  const [planIncome, setPlanIncome] = useState("");
  const [error, setError] = useState(null);

  const [planOutcome, setPlanOutcome] = useState("");
  const [comment, setComment] = useState("");

  const handleProjectCreation = (event) => {
    const project = {
      name,
      description,
      planIncome,
      planOutcome,
    };
    axios
      .post("/project", project, {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      })
      .then((res) => {
        props.setDrawerState(false);
        props.onFetchProjects(user.token, props.filters);
        if (projectId) {
          const project = res.data.project;
          history.push(`/projects/${project._id}`);
        }
      })
      .catch((error) => {
        setError(error);
      });
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name == "name") {
      setName(value);
    } else if (name == "description") {
      setDescription(value);
    } else if (name == "planIncome") {
      setPlanIncome(value);
    } else {
      setPlanOutcome(value);
    }
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        {editing ? "Проект" : "Добавить новый проект"}
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
            label="Описание"
            required
            multiline
            rowsMax="1"
            value={description}
            onChange={(e) => handleChange(e, "description")}
            variant="outlined"
          />
        </div>
        <div className={classes.row}>
          <TextField
            id="outlined-multiline-flexible"
            label="Плановый приход"
            required
            multiline
            rowsMax="1"
            value={planIncome}
            onChange={(e) => handleChange(e, "planIncome")}
            variant="outlined"
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Плановый расход"
            required
            multiline
            rowsMax="1"
            value={planOutcome}
            onChange={(e) => handleChange(e, "planOutcome")}
            variant="outlined"
          />
        </div>
        <Box justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleProjectCreation}
          >
            Сохранить
          </Button>
        </Box>
      </form>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
  };
};

export default connect(null, mapDispatchToProps)(Project);
