const moment = require("moment");

const {
  ACTIVITY_FINANCIAL,
  ACTIVITY_OPERATIONAL,
  ACTIVITY_INVESTMENT,
} = require("../constants");

const { INCOME, OUTCOME } = require("../constants");

const { populateWithBuckets } = require("./functions");

// Category Report Functions

exports.constuctReport = (aggResult, report, queryData) => {
  aggResult.forEach((category) => {
    let categoryInfo = {
      name: category._id.category,
      kind: category._id.kind,
      type: category._id.type,
      periods: populateWithBuckets(queryData),
    };

    category.operations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();
      categoryInfo.periods.total += +operation.amount;

      categoryInfo.periods.details.forEach((period, index) => {
        if (period.month == opMonth && period.year == opYear) {
          period.totalAmount += +operation.amount;
          period.operations.push(operation);

          if (categoryInfo.type === 1) {
            report.incomes.total += +operation.amount;
            report.incomes.details[index].totalAmount += +operation.amount;
          }
          if (categoryInfo.type === 2) {
            report.outcomes.total += +operation.amount;
            report.outcomes.details[index].totalAmount += +operation.amount;
          }
        }
      });
    });
    report.detailReport.push(categoryInfo);
  });
};

exports.getBalance = async (report) => {
  const { incomes, outcomes, balance } = report;
  for (let i = 0; i < balance.details.length; i++) {
    balance.details[i].balance =
      incomes.details[i].totalAmount - outcomes.details[i].totalAmount;
  }
  balance.total = incomes.total - outcomes.total;
};

// Activity Report Functions

exports.getSkeletonForActivityReport = (queryData) => {
  const bucket = populateWithBuckets(queryData);
  const report = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    operational: {
      ...populateWithBuckets(queryData),
      incomes: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
      outcomes: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
    },
    investment: {
      ...populateWithBuckets(queryData),
      incomes: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
      outcomes: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
    },
    financial: {
      ...populateWithBuckets(queryData),
      incomes: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
      outcomes: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };
  return report;
};

exports.putCategoriesByActivity = (aggResult, report, queryData) => {
  aggResult.forEach((category) => {
    const categoryInfo = {
      name: category._id.category,
      kind: category._id.kind,
      type: category._id.type,
      periods: populateWithBuckets(queryData),
      operations: category.operations,
    };
    const kind = category._id.kind;
    const type = category._id.type;

    switch (kind) {
      case ACTIVITY_FINANCIAL:
        if (type == INCOME) {
          report.financial.incomes.categories.push(categoryInfo);
        }
        if (type == OUTCOME) {
          report.financial.outcomes.categories.push(categoryInfo);
        }
        break;
      case ACTIVITY_INVESTMENT:
        if (type == INCOME) {
          report.investment.incomes.categories.push(categoryInfo);
        }
        if (type == OUTCOME) {
          report.investment.outcomes.categories.push(categoryInfo);
        }
        break;
      case ACTIVITY_OPERATIONAL:
        if (type == INCOME) {
          report.operational.incomes.categories.push(categoryInfo);
        }
        if (type == OUTCOME) {
          report.operational.outcomes.categories.push(categoryInfo);
        }
        break;
      default:
        break;
    }
  });
};

exports.constructReportByActivity = (report) => {
  report.incomes.categories.forEach((category) => {
    category.operations.forEach((operation) => {
      const opMonth = moment(operation.date).month();
      const opYear = moment(operation.date).year();
      category.periods.total += +operation.amount;

      category.periods.details.forEach((period, index) => {
        if (period.month == opMonth && period.year == opYear) {
          period.totalAmount += +operation.amount;
          period.operations.push(operation);

          report.incomes.total += +operation.amount;
          report.incomes.details[index].totalAmount += +operation.amount;

          report.total += +operation.amount;
          report.details[index].totalAmount += +operation.amount;
        }
      });
    });
  });
  report.outcomes.categories.forEach((category) => {
    category.operations.forEach((operation) => {
      const opMonth = moment(operation.date).month();
      const opYear = moment(operation.date).year();
      category.periods.total += +operation.amount;

      category.periods.details.forEach((period, index) => {
        if (period.month == opMonth && period.year == opYear) {
          period.totalAmount += +operation.amount;
          period.operations.push(operation);

          report.outcomes.total += +operation.amount;
          report.outcomes.details[index].totalAmount += +operation.amount;

          report.total -= +operation.amount;
          report.details[index].totalAmount -= +operation.amount;
        }
      });
    });
  });
};
