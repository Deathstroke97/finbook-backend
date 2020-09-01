export default Object.freeze({
  ACTIVITY_FINANCIAL: 1,
  ACTIVITY_INVESTMENT: 2,
  ACTIVITY_OPERATIONAL: 3,

  OPERATION_INCOME: "income",
  OPERATION_OUTCOME: "outcome",
  OPERATION_OBLIGATION: "obligation",

  OBLIGATION_IN: "in",
  OBLIGATION_OUT: "out",

  ACTION_EDIT: "edit",

  COMPLETED: "completed",
  UNCOMPLETED: "uncompleted",
  PLANNED: "planned",
  ALL: "all",

  PERIOD_WEEK: "week",
  PERIOD_MONTH: "month",
  PERIOD_TWO_MONTH: "twoMonth",
  PERIOD_QUARTER: "quarter",
  PERIOD_HALF_YEAR: "halfYear",
  PERIOD_YEAR: "year",

  CATEGORY: "category",
  ACTIVITY: "activity",
  ACCOUNT: "account",
  CONTRACTOR: "contractor",
  PROJECT: "project",
  //type of account below
  CASHBOX: "cashbox",

  METHOD_ACCRUAL: "accrual",
  METHOD_CASH: "cash",

  INCOME: 1,
  OUTCOME: 2,
  BALANCE: 3,

  CURRENT_MONTH: "currentMonth",
  CURRENT_QUARTER: "currentQuarter",
  CURRENT_YEAR: "currentYear",
  LAST_MONTH: "lastMonth",
  LAST_QUARTER: "lastQuarter",
  LAST_YEAR: "lastYear",
  ALL_TIME: "allTime",
  RANDOM_TIME: "randomTime",

  currencies: [
    {
      value: "RUB",
      label: "RUB",
    },
    {
      value: "EUR",
      label: "EUR",
    },
    {
      value: "USD",
      label: "USD",
    },
    {
      value: "KZT",
      label: "KZT",
    },
    {
      value: "UAH",
      label: "UAH",
    },
    {
      value: "GBP",
      label: "GBP",
    },
    {
      value: "BYN",
      label: "BYN",
    },
  ],
});
