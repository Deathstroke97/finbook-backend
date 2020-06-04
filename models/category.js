const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;
const Account = require("./account");
const Project = require("./project");
const Contractor = require("./contractor");
const Transaction = require("./transaction");
const ObjectId = mongoose.Types.ObjectId;

const {
  getMoneyInTheBeginning,
  getMoneyInTheEnd,
  getBalance,
  constuctReport,
  getSkeletonForActivityReport,
  constructReportByActivity,
  putCategoriesByActivity,
} = require("../utils/category");

const { populateWithBuckets } = require("../utils/functions");

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
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

categorySchema.statics.generateReportByCategory = async function ({
  businessId,
  queryData,
  countPlanned,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const Category = mongoose.model("Category", categorySchema);

  const aggResult = await Category.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
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
    {
      $sort: { "transactions.date": 1 },
    },
    {
      $group: {
        _id: { category: "$name", kind: "$kind", type: "$type" },
        total: { $sum: "$transactions.amount" },
        operations: { $push: "$transactions" },
      },
    },
  ]);

  // await Account.populate(aggResult, {
  //   path: "operations.account",
  //   select: "name",
  // });
  // await Contractor.populate(aggResult, {
  //   path: "operations.contractor",
  //   select: "name",
  // });
  // await Project.populate(aggResult, {
  //   path: "operations.project",
  //   select: "name",
  // });

  let report = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    incomes: populateWithBuckets(queryData),
    outcomes: populateWithBuckets(queryData),
    balance: populateWithBuckets(queryData),
    moneyInTheEnd: populateWithBuckets(queryData),
    detailReport: [],
  };

  await Account.getMoneyInTheBeginning(businessId, countPlanned, report);
  await Account.getMoneyInTheEnd(businessId, countPlanned, report);

  constuctReport(aggResult, report, queryData);
  getBalance(report);

  return report;
};

categorySchema.statics.generateReportByActivity = async function ({
  businessId,
  queryData,
  countPlanned,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const Category = mongoose.model("Category", categorySchema);

  const aggResult = await Category.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
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
    {
      $sort: { "transactions.date": 1 },
    },
    {
      $group: {
        _id: { category: "$name", kind: "$kind", type: "$type" },
        total: { $sum: "$transactions.amount" },
        operations: { $push: "$transactions" },
      },
    },
  ]);

  const report = getSkeletonForActivityReport(queryData);
  putCategoriesByActivity(aggResult, report, queryData);

  constructReportByActivity(report.operational);
  constructReportByActivity(report.financial);
  constructReportByActivity(report.investment);

  await Account.getMoneyInTheBeginning(businessId, countPlanned, report);
  await Account.getMoneyInTheEnd(businessId, countPlanned, report);

  return report;
};

module.exports = mongoose.model("Category", categorySchema);
