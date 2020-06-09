const { populateWithBuckets } = require("./functions");
const moment = require("moment");

exports.getSkeletonForAccountReport = (queryData) => {
  const report = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    incomes: {
      ...populateWithBuckets(queryData),

      accounts: [],
    },
    outcomes: {
      ...populateWithBuckets(queryData),
      accounts: [],
    },
    balance: {
      ...populateWithBuckets(queryData),
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };
  return report;
};

exports.constructReportByAccount = (aggResult, report, queryData) => {
  aggResult.forEach((account) => {
    report.incomes.accounts.push({
      name: account._id.account,
      periods: populateWithBuckets(queryData),
    });

    account.incomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.incomes.accounts.length - 1;

      report.incomes.accounts[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.incomes.total += +operation.amount;
            report.incomes.details[index].totalAmount += +operation.amount;
            report.incomes.accounts[
              lastIndex
            ].periods.total += +operation.amount;
          }
        }
      );
    });

    report.outcomes.accounts.push({
      name: account._id.account,
      periods: populateWithBuckets(queryData),
    });
    account.outcomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.outcomes.accounts.length - 1;

      report.outcomes.accounts[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.outcomes.total += +operation.amount;
            report.outcomes.details[index].totalAmount += +operation.amount;
            report.outcomes.accounts[
              lastIndex
            ].periods.total += +operation.amount;
          }
        }
      );
    });
  });
};
