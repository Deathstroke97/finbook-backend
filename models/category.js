const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Account = require("./account");
const ObjectId = mongoose.Types.ObjectId;

const {
  putCategoriesByActivity,
  getSkeletonForCategoryReport,
  constructReportByCategory,
  getEmptyCategoryTransactions,
  getSkeletonForProfitAndLossByCategory,
  constructProfitAndLossByCategory,
  calculateOperatingProfit,
  constructReportForSeparateCategories,
} = require("../utils/category");

const {
  calculateBalance,
  filterEmptyCategoriesCashFlow,
  filterEmptyCategoriesProfitAndLoss,
  populateTransactions,
} = require("../utils/functions");

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  isOwnerTransfer: Boolean,
  kind: {
    type: Number,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
});

categorySchema.statics.generateCashFlowByCategory = async function ({
  businessId,
  queryData,
  countPlanned,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const Category = mongoose.model("Category", categorySchema);

  const aggResult = await Category.aggregate([
    {
      $match: {
        $or: [{ business: ObjectId(businessId) }, { business: null }],
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "category",
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
      $group: {
        _id: { category: "$_id" },
        kind: { $first: "$kind" },
        type: { $first: "$type" },
        name: { $first: "$name" },
        operations: { $push: "$transactions" },
      },
    },
    {
      $project: {
        kind: 1,
        type: 1,
        name: 1,
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

  const emptyCategories = await getEmptyCategoryTransactions(
    businessId,
    countPlanned,
    queryData
  );
  aggResult.push(emptyCategories);
  await populateTransactions(aggResult);

  const report = getSkeletonForCategoryReport(queryData);
  constructReportByCategory(aggResult, report, queryData);

  await Account.getMoneyInTheBeginning(businessId, countPlanned, report);
  await Account.getMoneyInTheEnd(businessId, countPlanned, report);

  calculateBalance(report);

  filterEmptyCategoriesCashFlow(report);

  return report;
};

categorySchema.statics.generateCashFlowByActivity = async function ({
  businessId,
  queryData,
  countPlanned,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const Category = mongoose.model("Category", categorySchema);

  const aggResult = await Category.aggregate([
    {
      $match: {
        $or: [{ business: ObjectId(businessId) }, { business: null }],
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "category",
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
      $group: {
        _id: { category: "$_id" },
        kind: { $first: "$kind" },
        type: { $first: "$type" },
        name: { $first: "$name" },
        operations: { $push: "$transactions" },
      },
    },
    {
      $project: {
        kind: 1,
        type: 1,
        name: 1,
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

  const emptyCategories = await getEmptyCategoryTransactions(
    businessId,
    countPlanned,
    queryData
  );
  aggResult.push(emptyCategories);
  await populateTransactions(aggResult);

  const activities = putCategoriesByActivity(aggResult, queryData);

  constructReportByCategory(
    activities.financial.categories,
    activities.financial.report,
    queryData
  );
  constructReportByCategory(
    activities.operational.categories,
    activities.operational.report,
    queryData
  );
  constructReportByCategory(
    activities.investment.categories,
    activities.investment.report,
    queryData
  );

  calculateBalance(activities.financial.report);
  calculateBalance(activities.operational.report);
  calculateBalance(activities.investment.report);

  filterEmptyCategoriesCashFlow(activities.financial.report);
  filterEmptyCategoriesCashFlow(activities.operational.report);
  filterEmptyCategoriesCashFlow(activities.investment.report);

  delete activities.financial.categories;
  delete activities.operational.categories;
  delete activities.investment.categories;

  await Account.getMoneyInTheBeginning(businessId, countPlanned, activities);
  await Account.getMoneyInTheEnd(businessId, countPlanned, activities);

  return activities;
};

categorySchema.statics.generateProfitAndLossByCategory = async function ({
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
          category: "$category",
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
    path: "_id.category",
    select: "name",
  });

  const separateCategoriesReport = await this.constructReportForSeparateCategories(
    queryData,
    countPlanned,
    method
  );

  //separate categories's report ready, main report is next

  const report = getSkeletonForProfitAndLossByCategory(queryData);

  constructProfitAndLossByCategory(aggResult, report, queryData, method);
  filterEmptyCategoriesProfitAndLoss(report);
  calculateOperatingProfit(report);
  report.separateCategoriesReport = separateCategoriesReport;
  return report;
};

categorySchema.statics.constructReportForSeparateCategories = async (
  queryData,
  countPlanned,
  method
) => {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };
  const Category = mongoose.model("Category", categorySchema);
  const separateCategoriesIds = [
    "5ebecdab81f7e40ed8f8730a",
    "5eef32cbb903de06654362bc",
  ];
  const seperateCategories = await Category.aggregate([
    {
      $match: {
        $or: [
          { _id: ObjectId(separateCategoriesIds[0]) },
          { _id: ObjectId(separateCategoriesIds[1]) },
        ],
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "category",
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
      $group: {
        _id: { category: "$_id" },
        name: { $first: "$name" },
        operations: { $push: "$transactions" },
      },
    },
    {
      $project: {
        name: 1,
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

  const report = getSkeletonForCategoryReport(queryData);

  constructReportByCategory(seperateCategories, report, queryData, method);

  delete report.moneyInTheBeginning;
  delete report.moneyInTheEnd;
  delete report.balance;
  delete report.incomes;
  report.outcomes.categories.forEach((cat) => delete cat.operations);

  return report;
};

module.exports = mongoose.model("Category", categorySchema);
