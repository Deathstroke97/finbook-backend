const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;
const Account = require("../models/account");
const Project = require("../models/project");
const Contractor = require("../models/contractor");
const Transaction = require("../models/transaction");

const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");
const ObjectId = mongoose.Types.ObjectId;
const {
  populateWithBuckets,
  getMoneyInTheBeginning,
  getMoneyInTheEnd,
  getBalance,
} = require("../utils/category");

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

  // console.log("aggResult: ", aggResult);

  let report = {
    moneyInTheBeginning: populateWithBuckets([], queryData),
    incomes: populateWithBuckets([], queryData),
    outcomes: populateWithBuckets([], queryData),
    balance: populateWithBuckets([], queryData),
    moneyInTheEnd: populateWithBuckets([], queryData),
    detailReport: [],
  };

  await getMoneyInTheBeginning(
    businessId,
    countPlanned,
    report.moneyInTheBeginning
  );
  await getMoneyInTheEnd(businessId, countPlanned, report.moneyInTheEnd);

  aggResult.forEach((category) => {
    let categoryInfo = {
      name: category._id.category,
      kind: category._id.kind,
      type: category._id.type,
      periods: populateWithBuckets([], queryData),
      total: 0,
    };

    category.operations.forEach((operation, index) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();
      categoryInfo.total += +operation.amount;

      categoryInfo.periods.forEach((period, index) => {
        if (period.month == opMonth && period.year == opYear) {
          period.totalAmount += +operation.amount;
          period.operations.push(operation);

          if (categoryInfo.type === 1) {
            report.incomes[index].totalAmount += +operation.amount;
          }
          if (categoryInfo.type === 2) {
            report.outcomes[index].totalAmount += +operation.amount;
          }
        }
      });
    });
    report.detailReport.push(categoryInfo);
  });

  getBalance(report, report.balance);

  return report;
};

module.exports = mongoose.model("Category", categorySchema);
