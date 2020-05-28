const moment = require("moment");
const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");

exports.populateOverallReport = (report) => {
  const incomeCategories = report.detailReport.filter(
    (category) => category.type == 1
  );
  const outcomeCategories = report.detailReport.filter(
    (category) => category.type == 2
  );

  incomeCategories.forEach((category) => {
    category.months.forEach((m) => {
      let income = report.incomes.find((income) => {
        if (income.month == m.month && income.year == m.year) {
          return income;
        }
      });
      //нашли тот самый bucket(m, y) куда плюсуем totalAmount-ы cоотствующих месяцев
      if (income) {
        income.totalInThisMonth += +m.totalAmount;
      } else {
        report.incomes.push({
          month: m.month,
          year: m.year,
          totalInThisMonth: +m.totalAmount,
        });
      }
    });
  });

  outcomeCategories.forEach((category) => {
    category.months.forEach((m) => {
      let outcome = report.outcomes.find((outcome) => {
        if (outcome.month == m.month && outcome.year == m.year) {
          return outcome;
        }
      });

      if (outcome) {
        outcome.totalInThisMonth += +m.totalAmount;
      } else {
        report.outcomes.push({
          month: m.month,
          year: m.year,
          totalInThisMonth: +m.totalAmount,
        });
      }
    });
  });
};

exports.populateWithBuckets = (array, queryData) => {
  let startDate = moment(queryData.createTime.$gte);
  let endDate = moment(queryData.createTime.$lte);

  let month = moment(startDate);

  while (month <= endDate) {
    array.push({
      month: month.month(),
      year: month.year(),
      totalAmount: 0,
      operations: [],
    });
    month.add(1, "month");
  }
  return array;
};
