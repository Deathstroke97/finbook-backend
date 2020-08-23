const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;

const constants = require("../constants");
const { populateWithBuckets, getSkeleton } = require("./functions");

const Transaction = require("../models/transaction");

const getSkeletonForCategoryReport = (queryData) => {
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

const putCategoriesByActivity = (aggResult, queryData) => {
  const activities = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    financial: {
      kind: constants.ACTIVITY_FINANCIAL,
      categories: [],
      report: getSkeleton(queryData),
    },
    investment: {
      kind: constants.ACTIVITY_INVESTMENT,
      categories: [],
      report: getSkeleton(queryData),
    },
    operational: {
      kind: constants.ACTIVITY_OPERATIONAL,
      categories: [],
      report: getSkeleton(queryData),
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };

  aggResult.forEach((category) => {
    const kind = category.kind;

    switch (kind) {
      case constants.ACTIVITY_FINANCIAL:
        activities.financial.categories.push(category);
        break;
      case constants.ACTIVITY_INVESTMENT:
        activities.investment.categories.push(category);
        break;
      case constants.ACTIVITY_OPERATIONAL:
        activities.operational.categories.push(category);
        break;
      default:
        // activities.operational.categories.push(category);
        break;
    }
  });
  return activities;
};

const constructReportByCategory = (
  array,
  report,
  conversionRates,
  queryData,
  method
) => {
  array.forEach((category) => {
    report.incomes.categories.push({
      categoryId: category._id.category,
      name: category.name ? category.name : null,
      periods: populateWithBuckets(queryData),
      operations: [],
    });
    //buckets are ready for this category, time to put data
    category.incomeOperations.forEach((operation) => {
      let opMonth;
      let opYear;

      if (method == undefined || method === constants.METHOD_CASH) {
        opMonth = moment(operation.date).month();
        opYear = moment(operation.date).year();
      }
      if (method === constants.METHOD_ACCRUAL) {
        opMonth = moment(operation.relatedDate).month();
        opYear = moment(operation.relatedDate).year();
      }

      const lastIndex = report.incomes.categories.length - 1;

      report.incomes.categories[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            const converted =
              conversionRates[operation.account] * +operation.amount;

            period.totalAmount += converted;
            report.incomes.total += converted;
            report.incomes.details[index].totalAmount += converted;
            report.incomes.categories[lastIndex].periods.total += converted;
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
      let opMonth;
      let opYear;

      if (method == undefined || method === constants.METHOD_CASH) {
        opMonth = moment(operation.date).month();
        opYear = moment(operation.date).year();
      }
      if (method === constants.METHOD_ACCRUAL) {
        opMonth = moment(operation.relatedDate).month();
        opYear = moment(operation.relatedDate).year();
      }

      const lastIndex = report.outcomes.categories.length - 1;
      report.outcomes.categories[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            const converted =
              conversionRates[operation.account] * +operation.amount;

            period.totalAmount += converted;
            report.outcomes.total += converted;
            report.outcomes.details[index].totalAmount += converted;
            report.outcomes.categories[lastIndex].periods.total += converted;
            report.outcomes.categories[lastIndex].operations.push(operation);
          }
        }
      );
    });
  });
};

const getEmptyCategoryTransactions = async (
  businessId,
  countPlanned,
  queryData
) => {
  const category = {
    _id: {
      category: null,
    },
    kind: constants.ACTIVITY_OPERATIONAL,
  };
  const filterPlanned = countPlanned ? {} : { isPlanned: false };
  const incomeOperations = await Transaction.find({
    business: ObjectId(businessId),
    ...filterPlanned,
    date: queryData.createTime,
    category: null,
    type: constants.OPERATION_INCOME,
  });

  const outcomeOperations = await Transaction.find({
    business: ObjectId(businessId),
    ...filterPlanned,
    date: queryData.createTime,
    category: null,
    type: constants.OPERATION_OUTCOME,
  });
  category.incomeOperations = incomeOperations;
  category.outcomeOperations = outcomeOperations;
  return category;
};

const getSkeletonForProfitAndLossByCategory = (queryData) => {
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

const calculateOperatingProfit = (report) => {
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

const helperProfitAndLossByCategory = (
  conversionRates,
  array,
  report,
  type,
  queryData,
  method
) => {
  array.forEach((category) => {
    report.categories.push({
      categoryId: category._id.category,
      name: category.name ? category.name : null,
      periods: populateWithBuckets(queryData),
    });

    if (type === constants.INCOME) {
      category.incomeOperations.forEach((operation) => {
        let opMonth;
        let opYear;

        if (method == undefined || method === constants.METHOD_CASH) {
          opMonth = moment(operation.date).month();
          opYear = moment(operation.date).year();
        }
        if (method === constants.METHOD_ACCRUAL) {
          opMonth = moment(operation.relatedDate).month();
          opYear = moment(operation.relatedDate).year();
        }

        const lastIndex = report.categories.length - 1;

        report.categories[lastIndex].periods.details.forEach(
          (period, index) => {
            if (period.month == opMonth && period.year == opYear) {
              const converted =
                conversionRates[operation.account] * +operation.amount;
              period.totalAmount += converted;
              report.total += converted;
              report.details[index].totalAmount += converted;
              report.categories[lastIndex].periods.total += converted;
            }
          }
        );
      });
    }

    if (type === constants.OUTCOME) {
      category.outcomeOperations.forEach((operation) => {
        let opMonth;
        let opYear;

        if (method == undefined || method === constants.METHOD_CASH) {
          opMonth = moment(operation.date).month();
          opYear = moment(operation.date).year();
        }
        if (method === constants.METHOD_ACCRUAL) {
          opMonth = moment(operation.relatedDate).month();
          opYear = moment(operation.relatedDate).year();
        }

        const lastIndex = report.categories.length - 1;

        report.categories[lastIndex].periods.details.forEach(
          (period, index) => {
            if (period.month == opMonth && period.year == opYear) {
              const converted =
                conversionRates[operation.account] * +operation.amount;
              period.totalAmount += converted;
              report.total += converted;
              report.details[index].totalAmount += converted;
              report.categories[lastIndex].periods.total += converted;
            }
          }
        );
      });
    }
  });
};

const constructProfitAndLossByCategory = (
  aggResult,
  report,
  conversionRates,
  queryData,
  method
) => {
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

  helperProfitAndLossByCategory(
    conversionRates,
    transformed.withProjects,
    report.incomes.withProjects,
    constants.INCOME,
    queryData,
    method
  );
  helperProfitAndLossByCategory(
    conversionRates,
    transformed.withoutProjects,
    report.incomes.withoutProjects,
    constants.INCOME,
    queryData,
    method
  );
  helperProfitAndLossByCategory(
    conversionRates,
    transformed.withProjects,
    report.outcomes.withProjects,
    constants.OUTCOME,
    queryData,
    method
  );
  helperProfitAndLossByCategory(
    conversionRates,
    transformed.withoutProjects,
    report.outcomes.withoutProjects,
    constants.OUTCOME,
    queryData,
    method
  );
};

const constructReportForSeparateCategories = (aggResult, queryData, method) => {
  const separateCategoriesIds = [
    "5ebecdab81f7e40ed8f8730a",
    "5eef32cbb903de06654362bc",
  ];
  const separateCategories = [];
  aggResult.forEach((result) => {
    const categoryId =
      result._id.category && result._id.category._id.toString();
    if (categoryId) {
      if (separateCategoriesIds.indexOf(categoryId) !== -1) {
        separateCategories.push(result);
      }
    }
  });

  const report = getSkeletonForCategoryReport(queryData);
  constructReportByCategory(separateCategories, report, queryData, method);

  delete report.moneyInTheBeginning;
  delete report.moneyInTheEnd;
  delete report.balance;
  delete report.incomes;
  report.outcomes.categories.forEach((cat) => delete cat.operations);

  aggResult = aggResult.filter((result) => {
    const categoryId =
      result._id.category && result._id.category._id.toString();
    return separateCategoriesIds.indexOf(categoryId) === -1;
  });

  return {
    aggResult,
    separateCategoriesReport: report,
  };
};

exports.getSkeletonForCategoryReport = getSkeletonForCategoryReport;
exports.putCategoriesByActivity = putCategoriesByActivity;
exports.constructReportByCategory = constructReportByCategory;
exports.getEmptyCategoryTransactions = getEmptyCategoryTransactions;
exports.getSkeletonForProfitAndLossByCategory = getSkeletonForProfitAndLossByCategory;
exports.calculateOperatingProfit = calculateOperatingProfit;
exports.constructProfitAndLossByCategory = constructProfitAndLossByCategory;
exports.constructReportForSeparateCategories = constructReportForSeparateCategories;
