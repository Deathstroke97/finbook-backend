const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const Transaction = require("../models/transaction");
const { populateWithBuckets, getSkeleton } = require("./functions");
const constants = require("../constants");

exports.getSkeletonForProjectReport = (queryData) => {
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

exports.getProjectsReport = (aggResult, queryData) => {
  const mainReport = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    projects: [],
    balance: populateWithBuckets(queryData),
    moneyInTheEnd: populateWithBuckets(queryData),
  };
  aggResult.forEach((project) => {
    mainReport.projects.push({
      _id: project._id.project.project,
      name: project._id.project.projectName,
      categories: project.categories,
      report: getSkeleton(queryData),
    });
  });
  return mainReport;
};

exports.getEmptyProjectTransactions = async (
  businessId,
  countPlanned,
  queryData
) => {
  const project = {
    _id: {
      project: {
        project: null,
        projectName: null,
      },
    },
    categories: [],
  };
  const filterPlanned = countPlanned ? {} : { isPlanned: false };

  const aggResult = await Transaction.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
        ...filterPlanned,
        date: {
          $gte: new Date(queryData.createTime.$gte),
          $lte: new Date(queryData.createTime.$lte),
        },

        project: null,
      },
    },
    {
      $group: {
        _id: {
          category: "$category",
        },
        operations: { $push: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id.category",
        foreignField: "_id",
        as: "cat",
      },
    },
    {
      $project: {
        "_id.categoryName": "$cat.name",
        "_id.category": 1,
        operations: 1,
      },
    },
    {
      $project: {
        // "category._id": "$_id.category",
        "category._id.category": "$_id.category._id",
        "category.name": {
          $arrayElemAt: ["$_id.categoryName", 0],
        },
        "category.incomeOperations": {
          $filter: {
            input: "$operations",
            as: "operation",
            cond: { $eq: ["$$operation.type", "income"] },
          },
        },
        "category.outcomeOperations": {
          $filter: {
            input: "$operations",
            as: "operation",
            cond: { $eq: ["$$operation.type", "outcome"] },
          },
        },
        categoryName: 1,
      },
    },
  ]);
  aggResult.forEach((categoryInfo) => {
    project.categories.push(categoryInfo.category);
  });

  return project;
};

exports.calculateProjectsBalance = (report) => {
  report.balance.details.forEach((period, index) => {
    report.projects.forEach((project) => {
      period.totalAmount += project.report.balance.details[index].totalAmount;
    });
  });
  report.balance.details.forEach((period) => {
    report.balance.total += period.totalAmount;
  });
};

exports.getSkeletonForProfitAndLossByProject = (queryData) => {
  const report = {
    incomes: {
      withProjects: {
        ...populateWithBuckets(queryData),
        projects: [],
      },
      withoutProjects: {
        ...populateWithBuckets(queryData),
        projects: [],
      },
    },
    outcomes: {
      withProjects: {
        ...populateWithBuckets(queryData),
        projects: [],
      },
      withoutProjects: {
        ...populateWithBuckets(queryData),
        projects: [],
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

const helperProfitAndLossByProject = (
  array,
  report,
  type,
  queryData,
  method
) => {
  array.forEach((project) => {
    report.projects.push({
      projectId: project._id.project,
      name: project.name ? project.name : null,
      periods: populateWithBuckets(queryData),
    });

    if (type === constants.INCOME) {
      project.incomeOperations.forEach((operation) => {
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

        const lastIndex = report.projects.length - 1;

        report.projects[lastIndex].periods.details.forEach((period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.total += +operation.amount;
            report.details[index].totalAmount += +operation.amount;
            report.projects[lastIndex].periods.total += +operation.amount;
          }
        });
      });
    }

    if (type === constants.OUTCOME) {
      project.outcomeOperations.forEach((operation) => {
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

        const lastIndex = report.projects.length - 1;

        report.projects[lastIndex].periods.details.forEach((period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.total += +operation.amount;
            report.details[index].totalAmount += +operation.amount;
            report.projects[lastIndex].periods.total += +operation.amount;
          }
        });
      });
    }
  });
};

const constructProfitAndLossByProject = (
  aggResult,
  report,
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
          project: result._id.project,
        },
        incomeOperations: result.incomeOperations,
        outcomeOperations: result.outcomeOperations,
      });
    }
    if (result._id.project == null) {
      transformed.withoutProjects.push({
        _id: {
          project: result._id.project,
        },
        incomeOperations: result.incomeOperations,
        outcomeOperations: result.outcomeOperations,
      });
    }
  });

  helperProfitAndLossByProject(
    transformed.withProjects,
    report.incomes.withProjects,
    constants.INCOME,
    queryData,
    method
  );
  helperProfitAndLossByProject(
    transformed.withoutProjects,
    report.incomes.withoutProjects,
    constants.INCOME,
    queryData,
    method
  );
  helperProfitAndLossByProject(
    transformed.withProjects,
    report.outcomes.withProjects,
    constants.OUTCOME,
    queryData,
    method
  );
  helperProfitAndLossByProject(
    transformed.withoutProjects,
    report.outcomes.withoutProjects,
    constants.OUTCOME,
    queryData,
    method
  );
};

exports.getGrossProfit = (result) => {
  return {
    fact: (result.totalIncome.fact - result.totalOutcome.fact).toFixed(2),
    plan: (result.totalIncome.plan - result.totalOutcome.plan).toFixed(2),
  };
};

exports.getProfitability = (grossProfit, project, result) => {
  let profitability = {};
  if (+result.totalIncome.fact === 0) {
    profitability.fact = 0;
  }
  if (+project.planIncome === 0) {
    profitability.plan = 0;
  }
  if (+result.totalIncome.fact !== 0) {
    profitability.fact = parseFloat(
      ((grossProfit.fact * 100) / +result.totalIncome.fact).toFixed(2)
    );
  }
  if (+project.planIncome !== 0) {
    profitability.plan = parseFloat(
      ((grossProfit.plan * 100) / +project.planIncome).toFixed(2)
    );
  }
  return profitability;
};

exports.constructProfitAndLossByProject = constructProfitAndLossByProject;
