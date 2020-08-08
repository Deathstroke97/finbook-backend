const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const Transaction = require("./transaction");
const Account = require("./account");
const axios = require("axios");

const {
  calculateBalance,
  filterEmptyCategoriesCashFlow,
} = require("../utils/functions");
const {
  getEmptyProjectTransactions,
  getProjectsReport,
  calculateProjectsBalance,
  getSkeletonForProfitAndLossByProject,
  constructProfitAndLossByProject,
} = require("../utils/project");

const {
  constructReportByCategory,
  calculateOperatingProfit,
} = require("../utils/category");

const Category = require("./category");
const constants = require("../constants");

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    isFinished: {
      type: Boolean,
      default: false,
    },
    description: String,
    planIncome: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
    planOutcome: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
    factIncome: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
    factOutcome: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
  },
  { timestamps: true }
);

projectSchema.statics.generateCashFlowByProject = async function ({
  businessId,
  countPlanned,
  queryData,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const aggResult = await Project.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "project",
        as: "transactions",
      },
    },
    {
      $unwind: "$transactions",
    },
    {
      $match: {
        "transactions.date": {
          $gte: new Date(queryData.createTime.$gte),
          $lte: new Date(queryData.createTime.$lte),
        },
        ...filterPlanned,
      },
    },
    {
      $project: {
        "transactions.isPlanned": 0,
        "transactions.isPeriodic": 0,
        "transactions.rootOfPeriodicChain": 0,
        "transactions.isObligation": 0,

        "transactions.business:": 0,
        "transactions.contractor": 0,
        "transactions.project": 0,
        "transactions.account:": 0,
        "transactions.createdAt": 0,
        "transactions.updatedAt:": 0,
        "transactions.accountBalance": 0,
      },
    },
    // {
    //   $sort: { "transactions.date": 1 },
    // },
    {
      $group: {
        _id: {
          project: "$_id",
          category: {
            _id: "$transactions.category",
          },
          projectName: "$name",
        },
        operations: { $push: "$transactions" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id.category._id",
        foreignField: "_id",
        as: "cat",
      },
    },
    {
      $project: {
        "_id.categoryName": "$cat.name",
        "_id.project": 1,
        "_id.category": 1,
        "_id.projectName": 1,
        operations: 1,
      },
    },
    {
      $project: {
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
    {
      $project: {
        "_id.categoryName": 0,
        "_id.category": 0,
      },
    },
    {
      $group: {
        _id: {
          project: "$_id",
        },
        categories: {
          $push: "$category",
        },
      },
    },
  ]);

  const emptyProject = await getEmptyProjectTransactions(
    businessId,
    countPlanned,
    queryData
  );
  aggResult.push(emptyProject);

  const mainReport = getProjectsReport(aggResult, queryData);
  mainReport.projects.forEach((project) => {
    constructReportByCategory(project.categories, project.report, queryData);
  });
  mainReport.projects.forEach((project) => {
    calculateBalance(project.report);
    filterEmptyCategoriesCashFlow(project.report);
    delete project.categories;
  });

  await Account.getMoneyInTheBeginning(businessId, countPlanned, mainReport);
  await Account.getMoneyInTheEnd(businessId, countPlanned, mainReport);
  calculateProjectsBalance(mainReport);

  return mainReport;
};

projectSchema.statics.generateProfitAndLossByProject = async function ({
  businessId,
  queryData,
  countPlanned,
  method,
}) {
  const filterPlanned = countPlanned ? {} : { isPlanned: false };
  const Transaction = require("./transaction");

  const aggResult = await Transaction.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
        date: {
          $gte: new Date(queryData.createTime.$gte),
          $lte: new Date(queryData.createTime.$lte),
        },
        category: {
          $nin: [
            ObjectId("5ebecdab81f7e40ed8f8730a"),
            ObjectId("5eef32cbb903de06654362bc"),
          ],
        },
        ...filterPlanned,
      },
    },
    {
      $group: {
        _id: {
          project: "$project",
        },
        operations: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        incomeOperations: {
          $filter: {
            input: "$operations",
            as: "operation",
            cond: { $eq: ["$$operation.type", "income"] },
          },
        },
        outcomeOperations: {
          $filter: {
            input: "$operations",
            as: "operation",
            cond: { $eq: ["$$operation.type", "outcome"] },
          },
        },
      },
    },
  ]);

  await this.populate(aggResult, {
    path: "_id.project",
    select: "name",
  });

  const separateCategoriesReport = await Category.constructReportForSeparateCategories(
    queryData,
    countPlanned,
    method
  );

  //separate categories's report ready, main report is next

  const report = getSkeletonForProfitAndLossByProject(queryData);
  constructProfitAndLossByProject(aggResult, report, queryData, method);

  calculateOperatingProfit(report);
  report.separateCategoriesReport = separateCategoriesReport;
  return report;
};

projectSchema.methods.getFactSumTransactions = async function () {
  const Account = mongoose.model("Account");
  const Business = mongoose.model("Business");
  const aggResult = await Account.aggregate([
    {
      $match: {
        business: ObjectId(this.business),
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "account",
        as: "transactions",
      },
    },
    {
      $unwind: "$transactions",
    },
    {
      $match: {
        "transactions.isPlanned": false,
        "transactions.project": ObjectId(this._id),
      },
    },
    {
      $group: {
        _id: { account: "$name" },
        currency: { $first: "$currency" },
        operations: { $push: "$transactions" },
      },
    },
    {
      $project: {
        _id: 1,
        currency: 1,
        incomeOperations: {
          $filter: {
            input: "$operations",
            as: "operation",
            cond: { $eq: ["$$operation.type", "income"] },
          },
        },
        outcomeOperations: {
          $filter: {
            input: "$operations",
            as: "operation",
            cond: { $eq: ["$$operation.type", "outcome"] },
          },
        },
      },
    },
  ]);

  const transactions = {
    totalIncome: 0,
    totalOutcome: 0,
  };
  const business = await Business.findById(this.business);

  for (const account of aggResult) {
    let income = 0;
    let outcome = 0;

    account.incomeOperations.forEach(
      (operation) => (income += +operation.amount)
    );
    account.outcomeOperations.forEach(
      (operation) => (outcome += +operation.amount)
    );

    let exchangeRate = 1;
    if (account.currency != business.currency) {
      // const response = await axios.get(
      //   `https://free.currconv.com/api/v7/convert?q=${account.currency}_${business.currency}&compact=ultra&apiKey=763858c5637f159b8186`
      // );
      // exchangeRate = response.data[`${account.currency}_${business.currency}`];
    }

    transactions.totalIncome += exchangeRate * income;
    transactions.totalOutcome += exchangeRate * outcome;
  }
  this.factIncome = transactions.totalIncome;
  this.factOutcome = transactions.totalOutcome;
  await this.save();
};

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
