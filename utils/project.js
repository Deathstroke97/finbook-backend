const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Transaction = require("../models/transaction");
const { populateWithBuckets, getSkeleton } = require("./functions");

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
