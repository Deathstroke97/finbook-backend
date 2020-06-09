const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const {
  ACTIVITY_FINANCIAL,
  ACTIVITY_OPERATIONAL,
  ACTIVITY_INVESTMENT,
} = require("../constants");

const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");
const { INCOME, OUTCOME } = require("../constants");

const { populateWithBuckets, getSkeleton } = require("./functions");

const Transaction = require("../models/transaction");

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

exports.putCategoriesByActivity = (aggResult, queryData) => {
  const activities = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    financial: {
      kind: ACTIVITY_FINANCIAL,
      categories: [],
      report: getSkeleton(queryData),
    },
    investment: {
      kind: ACTIVITY_INVESTMENT,
      categories: [],
      report: getSkeleton(queryData),
    },
    operational: {
      kind: ACTIVITY_OPERATIONAL,
      categories: [],
      report: getSkeleton(queryData),
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };

  aggResult.forEach((category) => {
    const kind = category.kind;
    // console.log("kind: ", kind);

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
        // activities.operational.categories.push(category);
        break;
    }
  });

  return activities;
};

exports.constructReportByCategory = (array, report, queryData) => {
  array.forEach((category) => {
    // console.log("category.name: ", category.name, "category: ", category);
    report.incomes.categories.push({
      // name: category._id.category,
      categoryId: category._id.category,
      name: category.name ? category.name : null,
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
      categoryId: category._id.category,
      name: category.name ? category.name : null,
      // name: category._id.category,
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

exports.getEmptyCategoryTransactions = async (
  businessId,
  countPlanned,
  queryData
) => {
  const category = {
    _id: {
      category: null,
    },
    kind: ACTIVITY_OPERATIONAL,
  };
  const filterPlanned = countPlanned ? {} : { isPlanned: false };
  const incomeOperations = await Transaction.find({
    business: ObjectId(businessId),
    ...filterPlanned,
    date: queryData.createTime,
    category: null,
    type: OPERATION_INCOME,
  });

  const outcomeOperations = await Transaction.find({
    business: ObjectId(businessId),
    ...filterPlanned,
    date: queryData.createTime,
    category: null,
    type: OPERATION_OUTCOME,
  });
  category.incomeOperations = incomeOperations;
  category.outcomeOperations = outcomeOperations;
  return category;
};
