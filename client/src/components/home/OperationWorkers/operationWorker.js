import React, { useState } from "react";
import { connect } from "react-redux";
import Box from "@material-ui/core/Box";
import moment from "moment";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";

import "date-fns";

import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import Drawer from "@material-ui/core/Drawer";

import Button from "@material-ui/core/Button";

import { useStyles } from "./style";

import Category from "../../common/create/category";
import Contractor from "../../common/create/contractor";
import Project from "../../common/create/project";

const OperationWorker = (props) => {
  const classes = useStyles();
  const { accounts, projects, contractors, categories } = props;
  const { operation, editing } = props;
  console.log("operation: ", operation);
  const [amount, setAmount] = useState(editing && operation.amount);
  const [account, setAccount] = useState(editing ? operation.account._id : "");
  const [project, setProject] = useState(editing ? operation.project._id : "");
  const [category, setCategory] = useState(
    editing ? operation.category._id : ""
  );
  const [contractor, setContractor] = useState(
    editing ? operation.contractor._id : ""
  );
  const [description, setDescription] = useState(
    editing ? operation.description : ""
  );
  const [date, setDate] = useState(editing ? operation.date : new Date());
  const [relatedDate, setRelatedDate] = useState(
    editing ? operation.relatedDate : new Date()
  );
  const [state, setState] = useState({
    isObligation: editing ? operation.isObligation : false,
    hasRelatedDate: editing
      ? moment(operation.relatedDate).isSame(operation.date)
      : false,
    isPeriodic: editing ? operation.isPeriodic : false,
  });
  const [drawerIsOpen, setDrawerState] = useState(false);
  const [fieldName, setFieldName] = useState("category");

  const handleCheckBoxesChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked });
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

  const handleRelatedDateChange = (date) => {
    setRelatedDate(date);
  };

  const handleAmountChange = (event) => {
    setAmount(String(event.target.value));
  };

  const handleOperationClick = (event) => {
    props.setDrawerState(false);
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
    let actionText = "прихода";
    if (!amount) {
      if (action === "expense") {
        actionText = "расхода";
      }
    } else {
      if (amount < 0) {
        actionText = "расхода";
      }
    }
    let header = (
      <Typography className={classes.operationNameText}>
        {editing ? "Операция " : "Добавить операцию "}
        {actionText}
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
        <Typography className={classes.operationNameText}>
          {generateHeader()}
        </Typography>

        <form noValidate autoComplete="off">
          <TextField
            autoFocus
            required
            value={amount > 0 ? amount : amount < 0 ? -1 * amount : amount}
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
          <div className={classes.checkBoxContainer}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.isObligation}
                    onChange={handleCheckBoxesChange("isObligation")}
                    value="isObligation"
                    color="primary"
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
                    checked={state.hasrelatedDate}
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
            </FormGroup>
          </div>

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleOperationClick}
          >
            Добавить операцию
          </Button>
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
    projects: state.projects.projects,
    contractors: state.contractors.contractors,
    categories: state.categories.categories,
  };
};

export default connect(mapStateToProps, null)(OperationWorker);
