import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import Box from "@material-ui/core/Box";
import moment from "moment";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";

import "date-fns";

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

import { useStyles } from "./style";

import Account from "components/common/create/account";
import Category from "../../common/create/category";
import Contractor from "../../common/create/contractor";
import Project from "../../common/create/project";
import constants from "constants/constants";
import { repeatedPeriods } from "constants/periods";

const CreateOperation = (props) => {
  const classes = useStyles();
  const { user } = useContext(SessionContext);
  const { accounts, projects, contractors, categories } = props;
  const { projectId, contractorId } = useParams();

  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [project, setProject] = useState(projectId ? projectId : "");
  const [category, setCategory] = useState("");
  const [contractor, setContractor] = useState(
    contractorId ? contractorId : ""
  );
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(moment());
  const [relatedDate, setRelatedDate] = useState(date);
  const [repeatedPeriod, setRepeatedPeriod] = useState(null);
  const [repetitionEndDate, setRepetitionEndDate] = useState(moment());
  const [state, setState] = useState({
    isObligation: false,
    hasRelatedDate: false,
    isPeriodic: false,
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
    const amount = event.target.value;
    setAmount(String(event.target.value));
    if (amount === "") {
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

  const handleTransactionCreation = (event) => {
    if (checkValidity() === false) {
      return;
    }

    const transaction = {
      amount,
      account,
      project,
      category,
      contractor,
      description,
      date: moment(date).format("YYYY-MM-DD"),
      relatedDate: moment(relatedDate).format("YYYY-MM-DD"),
      period: repeatedPeriod,
      repetitionEndDate,
      isObligation: state.isObligation,
      isPeriodic: state.isPeriodic,
      type: props.action,
    };

    let filters = props.filters;
    let callback = function () {
      props.onFetchTransactions(user.token, filters);
    };

    /*
    // let callbackStart = function() {
    //   props.onCreateTransactionStart()
    // }
    // let callbackFail = function() {
    //   props.onCreateTransactionFail()
    // }
    */

    if (projectId) {
      filters = props.projectFilters;
      callback = function () {
        props.onFetchProject(user.token, projectId, filters);
        props.onFetchProjects(user.token, props.projectsFilters);
      };
    }
    if (contractorId) {
      filters = props.contractorFilters;
      callback = function () {
        props.onFetchContractor(user.token, contractorId, filters);
        props.onFetchContractors(user.token, props.contractorsFilters);
      };
    }
    props.onCreateTransaction(user.token, transaction, callback);
    props.setDrawerState(false);
  };

  const handleChange = (event, name) => {
    const value = event.target.value;
    if (name === "account") {
      setAccount(value);
      setRequiredFieldsState({
        ...requiredFieldsState,
        account: true,
      });
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
    const { action } = props;
    let actionText = "";
    if (action === constants.OPERATION_INCOME) {
      actionText = "прихода";
    }
    if (action === constants.OPERATION_OUTCOME) {
      actionText = "расхода";
    }

    let header = (
      <Typography className={classes.transactionNameText}>
        {`Добавить операцию ${actionText}`}
      </Typography>
    );
    return header;
  };

  const createContent = () => {
    let content = (
      <Category setDrawerState={setDrawerState} action={props.action} />
    );
    if (fieldName === constants.ACCOUNT) {
      content = <Account setDrawerState={setDrawerState} />;
    }
    if (fieldName === constants.CONTRACTOR) {
      content = <Contractor setDrawerState={setDrawerState} />;
    } else if (fieldName === constants.PROJECT) {
      content = <Project setDrawerState={setDrawerState} />;
    }
    return content;
  };

  return (
    <div className={classes.root} role="presentation">
      <Box>
        {generateHeader()}
        <form noValidate autoComplete="off">
          <TextField
            autoFocus
            required
            error={requiredFieldsState["amount"] === false}
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
          <div className={classes.row}>
            <TextField
              required
              id="outlined-select-currency"
              select
              error={requiredFieldsState["account"] === false}
              label="Счет"
              value={account}
              onChange={(e) => handleChange(e, "account")}
              helperText=""
              variant="outlined"
            >
              <MenuItem className={classes.leftMarginSmall}>
                <ControlPointIcon />
                <p
                  onClick={() => addNewFieldTo(constants.ACCOUNT)}
                  className={classes.leftMarginBig}
                >
                  Добавить cчет
                </p>
              </MenuItem>
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
                  onClick={() => addNewFieldTo(constants.CATEGORY)}
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
                  onClick={() => addNewFieldTo(constants.PROJECT)}
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
                  onClick={() => addNewFieldTo(constants.CONTRACTOR)}
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
                  checked={state.hasRelatedDate}
                  onChange={handleCheckBoxesChange("hasRelatedDate")}
                  value="hasRelatedDate"
                  color="primary"
                />
              }
              label="Дата начисления отличается от даты операции"
              classes={{
                root: classes.rootLable,
                label: classes.label,
              }}
            />
            {state.hasRelatedDate ? (
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
            ) : null}
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.isPeriodic}
                  onChange={handleCheckBoxesChange("isPeriodic")}
                  value="isPeriodic"
                  color="primary"
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
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              className={classes.addButton}
              onClick={handleTransactionCreation}
              // disabled={!isValidTransaction}
            >
              Добавить операцию
            </Button>
          </div>
        </form>
        <Box mt={1}>
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
    onCreateTransaction: (token, transaction, callback) =>
      dispatch(actions.createTransaction(token, transaction, callback)),
    // onCreateTransactionStart: () => dispatch(actions.createTransactionStart()),
    // onCreateTransactionFail: () => dispatch(actions.createTransactionFail()),
    onFetchTransactions: (token, filters) =>
      dispatch(actions.fetchTransactions(token, filters)),
    //projects
    onFetchProject: (token, projectId, filters) =>
      dispatch(actions.fetchProject(token, projectId, filters)),
    onFetchProjects: (token, filters) =>
      dispatch(actions.fetchProjects(token, filters)),
    //contractors
    onFetchContractors: (token, filters) =>
      dispatch(actions.fetchContractors(token, filters)),
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateOperation);
