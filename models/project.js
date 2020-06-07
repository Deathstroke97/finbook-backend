const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const Project = require("./project");
const moment = require("moment");
const { populateWithBuckets, calculateBalance } = require("../utils/functions");
const { getSkeletonForProjectReport } = require("../utils/project");

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
    planIncome: Schema.Types.Decimal128,
    planOutcome: Schema.Types.Decimal128,
  },
  { timestamps: true }
);

projectSchema.statics.getReportByProject = async function ({
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
    {
      $sort: { "transactions.date": 1 },
    },
    {
      $group: {
        _id: { account: "$name" },
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

  const report = getSkeletonForProjectReport(queryData);

  aggResult.forEach((account) => {
    report.incomes.accounts.push({
      name: account._id.account,
      periods: populateWithBuckets(queryData),
    });

    account.incomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.incomes.accounts.length - 1;

      report.incomes.accounts[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.incomes.total += +operation.amount;
            report.incomes.details[index].totalAmount += +operation.amount;
            report.incomes.accounts[
              lastIndex
            ].periods.total += +operation.amount;
          }
        }
      );
    });

    report.outcomes.accounts.push({
      name: account._id.account,
      periods: populateWithBuckets(queryData),
    });
    account.outcomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.outcomes.accounts.length - 1;

      report.outcomes.accounts[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.outcomes.total += +operation.amount;
            report.outcomes.details[index].totalAmount += +operation.amount;
            report.outcomes.accounts[
              lastIndex
            ].periods.total += +operation.amount;
          }
        }
      );
    });
  });

  await Account.getMoneyInTheBeginning(businessId, countPlanned, report);
  await Account.getMoneyInTheEnd(businessId, countPlanned, report);
  calculateBalance(report);

  return report;
};

module.exports = mongoose.model("Project", projectSchema);
