import React, { useState, useContext } from "react";
import * as actions from "store/actions";
import { SessionContext } from "context/SessionContext";
import axios from "axios-instance";
import { connect } from "react-redux";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import { useStyles } from "./style";
import {
  categoryTypes,
  activities,
  isOwnerTransferIncome,
  isOwnerTransferOutcome,
} from "dummyData";
import constants from "constants/constants";

const Category = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { action } = props;
  const isOwnerTransferArray =
    action === constants.OPERATION_INCOME
      ? isOwnerTransferIncome
      : isOwnerTransferOutcome;
  const [name, setName] = useState();
  const [type, setType] = useState(
    action === constants.OPERATION_INCOME ? constants.INCOME : constants.OUTCOME
  );
  const [kind, setKind] = useState(constants.ACTIVITY_OPERATIONAL);
  const [isOwnerTransfer, setIsOwnerTransfer] = useState(false);
  const [error, setError] = useState(null);

  const handleCategoryCreation = (event) => {
    const category = {
      name,
      type,
      kind,
      isOwnerTransfer,
    };
    axios
      .post("/category", category)
      .then((res) => {
        props.setDrawerState(false);
        props.onFetchCategories(user.token);
      })
      .catch((error) => setError(error));
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name == "name") {
      setName(value);
    } else if (name == "type") {
      setType(value);
    } else if (name == "kind") {
      setKind(value);
    }
  };

  const handleOwnerTransferChange = () => {
    setIsOwnerTransfer(!isOwnerTransfer);
  };

  return (
    <div className={classes.root}>
      <Box>
        <Typography className={classes.operationNameText}>
          Добавить новую статью
        </Typography>

        <form noValidate autoComplete="off">
          <div className={classes.row}>
            <TextField
              id="outlined-multiline-flexible"
              label="Название статьи"
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
              required
              id="outlined-select-currency"
              select
              label="Категория"
              value={type}
              onChange={(e) => handleChange(e, "type")}
              helperText=""
              variant="outlined"
            >
              {categoryTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              id="outlined-select-currency"
              select
              label="Вид деятельности"
              value={kind}
              onChange={(e) => handleChange(e, "kind")}
              helperText=""
              variant="outlined"
            >
              {activities.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              id="outlined-select-currency"
              select
              label="Тип"
              value={isOwnerTransfer}
              onChange={(e) => handleOwnerTransferChange()}
              helperText=""
              variant="outlined"
            >
              {isOwnerTransferArray.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <Box mt={1}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleCategoryCreation}
            >
              Добавить
            </Button>{" "}
          </Box>
        </form>
        <Box mt={3}>
          <Typography className={classes.terminology}>
            <span>Операционная деятельность</span> — это все движения денег,
            связанные с основной ежедневной работой бизнеса, которая
            обеспечивает прибыль.
          </Typography>
          <Typography className={classes.terminology}>
            <span>Финансовая деятельность</span> — это кредиты и инвестиционные
            транши. Вы просто получаете (или отдаете) деньги. Дальше они могут
            пойти в инвестиционную или операционную деятельность.
          </Typography>
          <Typography className={classes.terminology}>
            <span>Инвестиционная деятельность</span> — это покупка, продажа и
            обслуживание основных средств: оборудования, имущества, значимых
            объектов вашей инфраструктуры. Например, покупаете ту же кофемашину,
            чтобы варить кофе. Как бы инвестируете собственные деньги в себя.
          </Typography>
          <Typography className={classes.terminology}>
            <span>Типы ввода и вывода денег</span> - нужны для случаев, когда вы
            вводите уставной капитал или забираете дивиденды. Операции с типом
            «Ввод денег» не учитываются в отчетах как прибыль. А операции типа
            «Вывод денег» не учитываются как расход.
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchCategories: (token) => dispatch(actions.fetchCategories(token)),
  };
};

export default connect(null, mapDispatchToProps)(Category);
