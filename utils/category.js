const moment = require("moment");

const {
  ACTIVITY_FINANCIAL,
  ACTIVITY_OPERATIONAL,
  ACTIVITY_INVESTMENT,
} = require("../constants");

const { INCOME, OUTCOME } = require("../constants");

const { populateWithBuckets } = require("./functions");

// Category Report Functions

exports.getSkeletonForCategoryReport = (queryData) => {
  const report = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    incomes: {
      ...populateWithBuckets(queryData),
      categories: [],
    },
    outcomes: {
      ...populateWithBuckets(queryData),
      categories: [],
    },
    balance: {
      ...populateWithBuckets(queryData),
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };
  return report;
};

// Activity Report Functions

exports.getSkeletonForActivityReports = (queryData) => {
  const report = {
    incomes: {
      ...populateWithBuckets(queryData),
      categories: [],
    },
    outcomes: {
      ...populateWithBuckets(queryData),
      categories: [],
    },
    balance: {
      ...populateWithBuckets(queryData),
    },
  };
  return report;
};

exports.putCategoriesByActivity = (aggResult, queryData) => {
  const activities = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    financial: {
      kind: ACTIVITY_FINANCIAL,
      categories: [],
      report: exports.getSkeletonForActivityReports(queryData),
    },
    investment: {
      kind: ACTIVITY_INVESTMENT,
      categories: [],
      report: exports.getSkeletonForActivityReports(queryData),
    },
    operational: {
      kind: ACTIVITY_OPERATIONAL,
      categories: [],
      report: exports.getSkeletonForActivityReports(queryData),
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };

  aggResult.forEach((category) => {
    const kind = category._id.kind;

    switch (kind) {
      case ACTIVITY_FINANCIAL:
        activities.financial.categories.push(category);
        break;
      case ACTIVITY_INVESTMENT:
        activities.investment.categories.push(category);
        break;
      case ACTIVITY_OPERATIONAL:
        activities.operational.categories.push(category);
        break;
      default:
        break;
    }
  });
  return activities;
};

exports.constructReportByCategory = (array, report, queryData) => {
  array.forEach((category) => {
    report.incomes.categories.push({
      name: category._id.category,
      periods: populateWithBuckets(queryData),
      operations: [],
    });

    category.incomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.incomes.categories.length - 1;

      report.incomes.categories[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.incomes.total += +operation.amount;
            report.incomes.details[index].totalAmount += +operation.amount;
            report.incomes.categories[
              lastIndex
            ].periods.total += +operation.amount;
            report.incomes.categories[lastIndex].operations.push(operation);
          }
        }
      );
    });

    report.outcomes.categories.push({
      name: category._id.category,
      periods: populateWithBuckets(queryData),
      operations: [],
    });
    category.outcomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.outcomes.categories.length - 1;

      report.outcomes.categories[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.outcomes.total += +operation.amount;
            report.outcomes.details[index].totalAmount += +operation.amount;
            report.outcomes.categories[
              lastIndex
            ].periods.total += +operation.amount;
            report.outcomes.categories[lastIndex].operations.push(operation);
          }
        }
      );
    });
  });
};

exports.filterEmptyCategories = (report) => {
  report.incomes.categories = report.incomes.categories.filter(
    (category) => category.periods.total !== 0
  );
  report.outcomes.categories = report.outcomes.categories.filter(
    (category) => category.periods.total !== 0
  );
};
