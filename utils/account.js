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

exports.constructReportByAccount = (
  aggResult,
  report,
  queryData,
  conversionRates
) => {
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
            const converted =
              conversionRates[account.currency] * +operation.amount;
            period.totalAmount += converted;
            report.incomes.total += converted;
            report.incomes.details[index].totalAmount += converted;
            report.incomes.accounts[lastIndex].periods.total += converted;
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
            const converted =
              conversionRates[account.currency] * +operation.amount;
            period.totalAmount += converted;
            report.outcomes.total += converted;
            report.outcomes.details[index].totalAmount += converted;
            report.outcomes.accounts[lastIndex].periods.total += converted;
          }
        }
      );
    });
  });
};
