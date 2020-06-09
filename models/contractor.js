const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const Account = require("./account");
const moment = require("moment");
const { populateWithBuckets, calculateBalance } = require("../utils/functions");
const {
  getSkeletonForContractorReport,
  constructReportByContractor,
  getEmptyContractorTransactions,
} = require("../utils/contractor");

const contractorSchema = new Schema(
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
    contactPerson: String,
    phoneNumber: String,
    email: String,
    description: String,
    balance: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
  },
  { timestamps: true }
);

contractorSchema.statics.generateReportByContractor = async function ({
  businessId,
  countPlanned,
  queryData,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const aggResult = await Contractor.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "contractor",
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
        _id: { contractor: "$name" },
        total: { $sum: "$transactions.amount" },
        operations: { $push: "$transactions" },
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
  const emptyContractors = await getEmptyContractorTransactions(
    businessId,
    countPlanned,
    queryData
  );
  aggResult.push(emptyContractors);

  const report = getSkeletonForContractorReport(queryData);
  constructReportByContractor(aggResult, report, queryData);

  await Account.getMoneyInTheBeginning(businessId, countPlanned, report);
  await Account.getMoneyInTheEnd(businessId, countPlanned, report);
  calculateBalance(report);

  return report;
};

const Contractor = mongoose.model("Contractor", contractorSchema);

module.exports = Contractor;
