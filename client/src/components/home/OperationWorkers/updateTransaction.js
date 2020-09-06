import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import moment from "moment";
import clsx from "clsx";
import "date-fns";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Box from "@material-ui/core/Box";

import { useStyles } from "./style";

import Category from "../../common/create/category";
import Contractor from "../../common/create/contractor";
import Project from "../../common/create/project";
import constants from "constants/constants";
import { repeatedPeriods } from "constants/periods";
import { filterCategoriesByType } from "utils/functions";

const TransactionWorker = (props) => {
  const classes = useStyles();
  const { accounts, projects, contractors } = props;
  const { action } = props;
  const filtered = filterCategoriesByType(props.categories);
  const categories =
    action === constants.OPERATION_INCOME
      ? filtered.incomeCategories
      : filtered.outcomeCategories;

  const { projectId, contractorId } = useParams();
  const { user } = useContext(SessionContext);
  const { transaction, filters } = props;
  const transactionId = transaction._id;

  const [amount, setAmount] = useState(
    parseFloat(transaction.amount).toLocaleString()
  );
  const [account, setAccount] = useState(transaction.account._id);
  const [project, setProject] = useState(
    transaction.project ? transaction.project._id : null
  );

  const [category, setCategory] = useState(
    transaction.category ? transaction.category._id : null
  );
  const [contractor, setContractor] = useState(
    transaction.contractor ? transaction.contractor._id : null
  );
  console.log("transaction: ", transaction);
  const [description, setDescription] = useState(
    transaction.description ? transaction.description : null
  );
  const [date, setDate] = useState(transaction.date);
  const [relatedDate, setRelatedDate] = useState(transaction.relatedDate);
  const [repeatedPeriod, setRepeatedPeriod] = useState(
    transaction.period ? transaction.period : null
  );
  const [repetitionEndDate, setRepetitionEndDate] = useState(
    transaction.repetitionEndDate ? transaction.repetitionEndDate : null
  );

  const [state, setState] = useState({
    isObligation: transaction.isObligation,
    relatedDateBoxChecked: !moment(transaction.relatedDate).isSame(
      transaction.date
    ),
    isPeriodic: transaction.isPeriodic,
  });
  const [drawerIsOpen, setDrawerState] = useState(false);
  const [fieldName, setFieldName] = useState("category");

  const [requiredFieldsState, setRequiredFieldsState] = useState({
    amount: true,
    account: true,
  });

  const handleCheckBoxesChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked });
  };

  const handleDateChange = (value) => {
    const date = moment(value).format("YYYY-MM-DD");
    setDate(date);
    setRelatedDate(date);
  };

  const handleRelatedDateChange = (value) => {
    const relatedDate = moment(value).format("YYYY-MM-DD");
    setRelatedDate(relatedDate);
  };

  const handleAmountChange = (event) => {
    const value = String(event.target.value);
    const spaceRemoved = value.replace(/\s/g, "");
    if (isNaN(spaceRemoved)) {
      return;
    }
    if (spaceRemoved === "") {
      setAmount("");
    } else {
      setAmount(parseFloat(spaceRemoved).toLocaleString());
    }
    if (spaceRemoved === "") {
      setRequiredFieldsState({
        ...requiredFieldsState,
        amount: false,
      });
      return;
    }
    setRequiredFieldsState({
      ...requiredFieldsState,
      amount: true,
    });
  };

  const handleRepetitionEndDateChange = (date) => {
    setRepetitionEndDate(date);
  };

  const checkValidity = () => {
    const isNotEmpty = amount !== "" && account !== "";
    let updatedReqFields = requiredFieldsState;
    if (amount === "") {
      updatedReqFields = {
        ...updatedReqFields,
        amount: false,
      };
    }
    if (account === "") {
      updatedReqFields = {
        ...updatedReqFields,
        account: false,
      };
    }
    setRequiredFieldsState(updatedReqFields);
    return isNotEmpty;
  };

  const getCallBack = () => {
    let filters = props.filters;
    let callback = function () {
      props.onFetchTransactions(user.token, filters);
    };
    if (projectId) {
      filters = props.projectFilters;
      callback = function () {
        props.onFetchProject(user.token, projectId, filters);
      };
    }
    if (contractorId) {
      filters = props.contractorFilters;
      callback = function () {
        props.onFetchContractor(user.token, contractorId, filters);
      };
    }
    return callback;
  };

  const handleTransactionUpdate = (event) => {
    if (checkValidity() === false) {
      return;
    }
    console.log("starting updating process...");
    const transaction = {
      id: transactionId,
      date: moment(date).format("YYYY-MM-DD"),
      relatedDate: moment(relatedDate).format("YYYY-MM-DD"),
      amount: amount.replace(/\s/g, ""),
      account,
      project,
      description,
      contractor,
      category,
      isObligation: state.isObligation,
      isPeriodic: state.isPeriodic,
      period: repeatedPeriod,
      repetitionEndDate,
    };
    props.onUpdateTransaction(user.token, transaction, getCallBack());
    props.setDrawerState(false);
  };

  const handleTransactionDeletion = (event) => {
    props.onDeleteTransactions(user.token, [transaction._id], getCallBack());
    props.setDrawerState(false);
  };

  const cancelTransactionRepetition = () => {
    props.onCancelTransactionRepetition(
      user.token,
      transaction.periodicChainId,
      transaction._id,
      getCallBack()
    );
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name === "account") {
      setAccount(value);
    } else if (name === "project") {
      setProject(value);
    } else if (name === "category") {
      setCategory(value);
    } else if (name === "contractor") {
      setContractor(value);
    } else if (name === "repeatedPeriod") {
      setRepeatedPeriod(value);
    } else {
      setDescription(value);
    }
  };

  const handleActionClick = (event, open) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerState(open);
  };

  const addNewFieldTo = (listName) => {
    setFieldName(listName);
    setDrawerState(true);
  };

  const generateHeader = () => {
    let actionText = "";
    if (action === constants.OPERATION_INCOME) {
      actionText = "прихода";
    }
    if (action === constants.OPERATION_OUTCOME) {
      actionText = "расхода";
    }

    let header = (
      <Typography className={classes.transactionNameText}>
        {`Операция ${actionText}`}
      </Typography>
    );
    return header;
  };

  const createContent = () => {
    let content = <Category />;
    if (fieldName === "contractor") {
      content = <Contractor />;
    } else if (fieldName === "project") {
      content = <Project />;
    }
    return content;
  };

  return (
    <div className={classes.root} role="presentation">
      <Box>
        <Typography className={classes.transactionNameText}>
          {generateHeader()}
        </Typography>

        <form noValidate autoComplete="off">
          <TextField
            autoFocus
            required
            error={requiredFieldsState["amount"] === false}
            value={amount}
            onChange={handleAmountChange}
            id="string-amount"
            label="Сумма"
            type="string"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            classes={{
              root: classes.textFieldRoot,
            }}
          />
          <div className={classes.row}>
            <TextField
              required
              error={requiredFieldsState["account"] === false}
              id="outlined-select-currency"
              select
              label="Счет"
              value={String(account).trim()}
              onChange={(e) => handleChange(e, "account")}
              helperText=""
              variant="outlined"
            >
              {accounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.name}
                </MenuItem>
              ))}
            </TextField>
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
                  value={date}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </Grid>
            </MuiPickersUtilsProvider>
          </div>
          <div className={classes.row}>
            <TextField
              id="outlined-select-currency"
              select
              label="Статья"
              value={category}
              onChange={(e) => handleChange(e, "category")}
              helperText=""
              variant="outlined"
            >
              <MenuItem className={classes.leftMarginSmall}>
                <ControlPointIcon />
                <p
                  onClick={() => addNewFieldTo("category")}
                  className={classes.leftMarginBig}
                >
                  Добавить статью
                </p>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="outlined-select-currency"
              select
              label="Проект"
              value={project}
              onChange={(e) => handleChange(e, "project")}
              helperText=""
              variant="outlined"
            >
              <MenuItem className={classes.leftMarginSmall}>
                <ControlPointIcon />
                <p
                  onClick={() => addNewFieldTo("project")}
                  className={classes.leftMarginBig}
                >
                  Добавить проект
                </p>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className={classes.row}>
            <TextField
              id="outlined-select-currency"
              select
              label="Контрагент"
              value={contractor}
              onChange={(e) => handleChange(e, "contractor")}
              helperText=""
              variant="outlined"
            >
              <MenuItem className={classes.leftMarginSmall}>
                <ControlPointIcon />
                <p
                  onClick={() => addNewFieldTo("contractor")}
                  className={classes.leftMarginBig}
                >
                  Добавить контрагента
                </p>
              </MenuItem>
              {contractors.map((contractor) => (
                <MenuItem key={contractor._id} value={contractor._id}>
                  {contractor.name}
                </MenuItem>
              ))}
            </TextField>
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

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.isObligation}
                  onChange={handleCheckBoxesChange("isObligation")}
                  value="isObligation"
                  color="primary"
                  disabled={!contractor}
                />
              }
              label="Учитывать в обязательствах"
              classes={{
                root: classes.rootLable,
                label: classes.label,
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.relatedDateBoxChecked}
                  onChange={handleCheckBoxesChange("relatedDateBoxChecked")}
                  value="relatedDateBoxChecked"
                  color="primary"
                />
              }
              label="Дата начисления отличается от даты операции"
              classes={{
                root: classes.rootLable,
                label: classes.label,
              }}
            />
            {state.relatedDateBoxChecked && (
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container justify="flex-start">
                  <KeyboardDatePicker
                    required
                    style={{ marginTop: 4 }}
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Дата начисления"
                    value={relatedDate}
                    onChange={handleRelatedDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.isPeriodic}
                  onChange={handleCheckBoxesChange("isPeriodic")}
                  value="isPeriodic"
                  color="primary"
                  disabled={
                    transaction.periodicChainId &&
                    transaction._id !== transaction.periodicChainId
                  }
                />
              }
              label="Повторять эту операцию"
              classes={{
                root: classes.rootLable,
                label: classes.label,
              }}
            />
            {state.isPeriodic && (
              <div className={classes.row}>
                <TextField
                  id="outlined-select-currency"
                  select
                  label="Периодичность"
                  value={repeatedPeriod}
                  onChange={(e) => handleChange(e, "repeatedPeriod")}
                  helperText=""
                  variant="outlined"
                  disabled={
                    transaction.periodicChainId &&
                    transaction._id !== transaction.periodicChainId
                  }
                >
                  {repeatedPeriods.map((period, index) => (
                    <MenuItem key={index} value={period.value}>
                      {period.label}
                    </MenuItem>
                  ))}
                </TextField>
                {repeatedPeriod && (
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid container justify="flex-start">
                      <KeyboardDatePicker
                        required
                        style={{ marginTop: 4 }}
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Закончить повторение"
                        value={repetitionEndDate}
                        onChange={handleRepetitionEndDateChange}
                        disabled={
                          transaction.periodicChainId &&
                          transaction._id !== transaction.periodicChainId
                        }
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                      />
                    </Grid>
                  </MuiPickersUtilsProvider>
                )}
                {repeatedPeriod ? null : <div />}
              </div>
            )}
          </FormGroup>
          {transaction.isPeriodic ? (
            <Box>
              <Button
                variant="outlined"
                className={classes.buttonСancelRepetition}
                // color="primary"
                // className={classes.addButton}
                onClick={cancelTransactionRepetition}
              >
                Отменить повторение операции
              </Button>
            </Box>
          ) : null}

          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              className={classes.addButton}
              onClick={handleTransactionUpdate}
            >
              Cохранить
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.deleteButton}
              onClick={handleTransactionDeletion}
            >
              Удалить
            </Button>
          </div>
        </form>
        <Box>
          <Typography className={classes.terminology}>
            <span>Дата начисления</span> показывает на какой момент времени вы
            хотите отнести выручку. Этим она отличается от фактической даты
            операции. Например, вы оказали услугу в мае, а деньги от клиента за
            эту услугу пришли в июне, тогда вам нужно указать это как выручку за
            май — для этого и нужна дата начисления. Таким образом, фактическая
            дата операции — в июне, а начислены деньги — за май.
          </Typography>
          <Typography className={classes.terminology}>
            <span>Учитывать в обязательствах</span> изменить баланс контрагента
            на основании этой операции.Например, если вы получили предоплату, то
            баланс контрагента станет отрицательным, что означает, что вы должны
            закрыть свое обязательство перед ним: оказать услугу или отгрузить
            товар.
          </Typography>
        </Box>
      </Box>
      <Drawer
        anchor="left"
        open={drawerIsOpen}
        onClose={(e) => handleActionClick(e, false)}
      >
        {createContent()}
      </Drawer>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts.accounts,
    projects: state.projects.projects.projects,
    contractors: state.contractors.contractors.contractors,
    categories: state.categories.categories,
    filters: state.transactions.filters,
    projectFilters: state.projects.project.filters,
    contractorFilters: state.contractors.contractor.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onDeleteTransactions: (token, transactions, callback) =>
      dispatch(actions.deleteTransactions(token, transactions, callback)),
    onUpdateTransaction: (token, transaction, filters) =>
      dispatch(actions.updateTransaction(token, transaction, filters)),
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
    onCancelTransactionRepetition: (
      token,
      periodicChainId,
      transactionId,
      callback
    ) =>
      dispatch(
        actions.cancelTransactionRepetition(
          token,
          periodicChainId,
          transactionId,
          callback
        )
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionWorker);
