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

const {
  populateWithBuckets,
  getSkeleton,
  filterEmptyCategoriesCashFlow,
} = require("./functions");

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
    report.incomes.categories.push({
      categoryId: category._id.category,
      name: category.name ? category.name : null,
      periods: populateWithBuckets(queryData),
      operations: [],
    });
    //buckets are ready for this category, time to put data
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
      periods: populateWithBuckets(queryData),
      operations: [],
    });
    //buckets are ready for this category, time to put data
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

exports.getSkeletonForProfitAndLossByCategory = (queryData) => {
  const report = {
    incomes: {
      withProjects: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
      withoutProjects: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
    },
    outcomes: {
      withProjects: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
      withoutProjects: {
        ...populateWithBuckets(queryData),
        categories: [],
      },
    },
    operatingProfit: {
      ...populateWithBuckets(queryData),
    },
    operatingProfitability: {
      ...populateWithBuckets(queryData),
    },
  };
  return report;
};

exports.calculateOperatingProfit = (report) => {
  const { incomes, outcomes, operatingProfit, operatingProfitability } = report;

  for (let i = 0; i < operatingProfit.details.length; i++) {
    const totalIncomeInPeriod =
      incomes.withProjects.details[i].totalAmount +
      incomes.withoutProjects.details[i].totalAmount;

    const totalOutcomeInPeriod =
      outcomes.withProjects.details[i].totalAmount +
      outcomes.withoutProjects.details[i].totalAmount;

    const balance = totalIncomeInPeriod - totalOutcomeInPeriod;

    operatingProfit.details[i].totalAmount = balance;

    if (totalIncomeInPeriod !== 0) {
      operatingProfitability.details[i].totalAmount =
        (balance * 100) / totalIncomeInPeriod;
    }
  }
  const totalIncome =
    incomes.withProjects.total + incomes.withoutProjects.total;
  const totalOutcome =
    outcomes.withProjects.total + outcomes.withoutProjects.total;
  const totalBalance = totalIncome - totalOutcome;
  operatingProfit.total = totalBalance;
  operatingProfitability.total = (totalBalance * 100) / totalIncome;
};

exports.helperProfitAndLossByCategory = (array, report, type, queryData) => {
  array.forEach((category) => {
    report.categories.push({
      categoryId: category._id.category,
      name: category.name ? category.name : null,
      periods: populateWithBuckets(queryData),
    });

    if (type === INCOME) {
      category.incomeOperations.forEach((operation) => {
        let opMonth = moment(operation.date).month();
        let opYear = moment(operation.date).year();

        const lastIndex = report.categories.length - 1;

        report.categories[lastIndex].periods.details.forEach(
          (period, index) => {
            if (period.month == opMonth && period.year == opYear) {
              period.totalAmount += +operation.amount;
              report.total += +operation.amount;
              report.details[index].totalAmount += +operation.amount;
              report.categories[lastIndex].periods.total += +operation.amount;
            }
          }
        );
      });
    }
    if (type === OUTCOME) {
      category.outcomeOperations.forEach((operation) => {
        let opMonth = moment(operation.date).month();
        let opYear = moment(operation.date).year();

        const lastIndex = report.categories.length - 1;

        report.categories[lastIndex].periods.details.forEach(
          (period, index) => {
            if (period.month == opMonth && period.year == opYear) {
              period.totalAmount += +operation.amount;
              report.total += +operation.amount;
              report.details[index].totalAmount += +operation.amount;
              report.categories[lastIndex].periods.total += +operation.amount;
            }
          }
        );
      });
    }
  });
};

exports.constructProfitAndLossByCategory = (aggResult, report, queryData) => {
  const transformed = {
    withProjects: [],
    withoutProjects: [],
  };

  aggResult.forEach((result) => {
    if (result._id.project !== null) {
      transformed.withProjects.push({
        _id: {
          category: result._id.category,
        },
        incomeOperations: result.incomeOperations,
        outcomeOperations: result.outcomeOperations,
      });
    }
    if (result._id.project == null) {
      transformed.withoutProjects.push({
        _id: {
          category: result._id.category,
        },
        incomeOperations: result.incomeOperations,
        outcomeOperations: result.outcomeOperations,
      });
    }
  });
  exports.helperProfitAndLossByCategory(
    transformed.withProjects,
    report.incomes.withProjects,
    INCOME,
    queryData
  );
  exports.helperProfitAndLossByCategory(
    transformed.withoutProjects,
    report.incomes.withoutProjects,
    INCOME,
    queryData
  );
  exports.helperProfitAndLossByCategory(
    transformed.withProjects,
    report.outcomes.withProjects,
    OUTCOME,
    queryData
  );
  exports.helperProfitAndLossByCategory(
    transformed.withoutProjects,
    report.outcomes.withoutProjects,
    OUTCOME,
    queryData
  );
};

// exports.constructReportForSeparateCategories = (aggResult, queryData) => {
//   let separateCategoriesIds = [
//     "5ebecdab81f7e40ed8f8730a",
//     "5eef32cbb903de06654362bc",
//   ];
//   let separateCategories = [];
//   aggResult.forEach((result) => {
//     const categoryId = result._id.category && result._id.category.toString();
//     if (categoryId) {
//       if (separateCategoriesIds.indexOf(categoryId) !== -1) {
//         separateCategories.push(result);
//       }
//     }
//   });
//   const report = exports.getSkeletonForCategoryReport(queryData);
//   exports.constructReportByCategory(separateCategories, report, queryData);
//   delete report.moneyInTheBeginning;
//   delete report.moneyInTheEnd;
//   delete report.balance;
//   delete report.incomes;
//   report.outcomes.categories.forEach((cat) => delete cat.operations);

//   aggResult = aggResult.filter((result) => {
//     const categoryId = result._id.category && result._id.category.toString();
//     return separateCategoriesIds.indexOf(categoryId) === -1;
//   });

//   return {
//     aggResult,
//     separateCategoriesReport: report,
//   };
// };
