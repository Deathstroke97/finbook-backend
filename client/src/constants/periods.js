import moment from "moment";
import constants from "./constants";

export const repeatedPeriods = [
  {
    value: constants.PERIOD_WEEK,
    label: "Каждую неделю",
  },
  {
    value: constants.PERIOD_MONTH,
    label: "Каждый месяц",
  },
  {
    value: constants.PERIOD_TWO_MONTH,
    label: "Каждые два месяца",
  },
  {
    value: constants.PERIOD_QUARTER,
    label: "Каждый квартал",
  },
  {
    value: constants.PERIOD_HALF_YEAR,
    label: "Каждые полгода",
  },
  {
    value: constants.PERIOD_YEAR,
    label: "Каждый год",
  },
];

const periods = Object.freeze({
  [constants.CURRENT_MONTH]: {
    value: constants.CURRENT_MONTH,
    label: "Текущий месяц",
    startTime: moment().startOf("month").format("YYYY-MM-DD"),
    endTime: moment().endOf("month").format("YYYY-MM-DD"),
  },
  [constants.CURRENT_QUARTER]: {
    value: constants.CURRENT_QUARTER,
    label: "Текущий квартал",
    startTime: moment().startOf("quarter").format("YYYY-MM-DD"),
    endTime: moment().endOf("quarter").format("YYYY-MM-DD"),
  },

  [constants.CURRENT_YEAR]: {
    value: constants.CURRENT_YEAR,
    label: "Текущий год",
    startTime: moment().startOf("year").format("YYYY-MM-DD"),
    endTime: moment().endOf("year").format("YYYY-MM-DD"),
  },
  [constants.LAST_MONTH]: {
    value: constants.LAST_MONTH,
    label: "Прошлый месяц",
    startTime: moment()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD"),
    endTime: moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  },
  [constants.LAST_QUARTER]: {
    value: constants.LAST_QUARTER,
    label: "Прошлый квартал",
    startTime: moment()
      .subtract(1, "quarter")
      .startOf("quarter")
      .format("YYYY-MM-DD"),
    endTime: moment()
      .subtract(1, "quarter")
      .endOf("quarter")
      .format("YYYY-MM-DD"),
  },
  [constants.LAST_YEAR]: {
    value: constants.LAST_YEAR,
    label: "Прошлый год",

    startTime: moment()
      .subtract(1, "year")
      .startOf("year")
      .format("YYYY-MM-DD"),
    endTime: moment().subtract(1, "year").endOf("year").format("YYYY-MM-DD"),
  },
  [constants.RANDOM_TIME]: {
    value: constants.RANDOM_TIME,
    label: "Произвольный период",
    startTime: moment().startOf("month").format("YYYY-MM-DD"),
    endTime: moment().endOf("month").format("YYYY-MM-DD"),
  },
  [constants.ALL_TIME]: {
    value: constants.ALL_TIME,
    label: "Все время",
  },
});

export default periods;
