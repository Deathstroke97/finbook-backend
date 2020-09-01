import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";

const Group = props => {
  const classes = useStyles();

  const [name, setName] = useState();

  const handleOperationClick = event => {
    props.setDrawerState(false);
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    setName(value);
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.operationNameText}>
        Добавить новую группу статей доходов
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
            onChange={e => handleChange(e, "name")}
            variant="outlined"
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleOperationClick}
        >
          Добавить
        </Button>{" "}
      </form>
    </div>
  );
};

export default Group;
