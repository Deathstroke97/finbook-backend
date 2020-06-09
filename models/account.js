const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const { populateWithBuckets, calculateBalance } = require("../utils/functions");
const {
  getSkeletonForAccountReport,
  constructReportByAccount,
} = require("../utils/account");

const accountSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  currency: {
    type: String,
    enum: ["RUR", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],
    required: true,
  },
  number: {
    type: String,
  },
  bankName: String,
  balance: {
    type: Schema.Types.Decimal128,
    default: 0,
  },
  initialBalance: {
    type: Schema.Types.Decimal128,
    default: 0,
  },
  initialBalanceDate: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.statics.getMoneyInTheBeginning = async (
  businessId,
  countPlanned,
  report
) => {
  const Transaction = require("./transaction");
  const array = report.moneyInTheBeginning.details;
  const filterPlanned = countPlanned ? {} : { isPlanned: false };

  const accounts = await Account.find({ business: businessId });

  for (let i = 0; i < array.length; i++) {
    let month = array[i].month;
    let year = array[i].year;
    let date = moment([year, month, 1]);

    let totalAmount = 0;
    const transactions = [];

    for (let i = 0; i < accounts.length; i++) {
      const transaction = Transaction.find({
        business: businessId,
        ...filterPlanned,
        account: accounts[i]._id,
        date: { $lt: date },
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(1);
      transactions.push(transaction);
    }
    Promise.all(transactions).then((transactions) => {
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        if (transaction.length > 0) {
          accountBalance = parseFloat(transaction[0].accountBalance);
          totalAmount += accountBalance;
        } else {
          if (date >= moment(accounts[i].initialBalanceDate)) {
            totalAmount += +accounts[i].initialBalance;
          }
        }
      }
      array[i].totalAmount = totalAmount;
    });
  }
};

accountSchema.statics.getMoneyInTheEnd = async (
  businessId,
  countPlanned,
  report
) => {
  const Transaction = require("./transaction");
  const array = report.moneyInTheEnd.details;
  const filterPlanned = countPlanned ? {} : { isPlanned: false };
  const accounts = await Account.find({ business: businessId });

  for (let i = 0; i < array.length; i++) {
    let month = array[i].month;
    let year = array[i].year;
    let date = moment([year, month, 1]).endOf("month");

    let totalAmount = 0;
    const promises = [];

    for (let i = 0; i < accounts.length; i++) {
      const transaction = Transaction.find({
        business: businessId,
        ...filterPlanned,
        account: accounts[i]._id,
        date: { $lte: date },
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(1);
      promises.push(transaction);
    }
    const transactions = await Promise.all(promises);
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      if (transaction.length > 0) {
        accountBalance = parseFloat(transaction[0].accountBalance);
        totalAmount += accountBalance;
      } else {
        if (date >= moment(accounts[i].initialBalanceDate)) {
          totalAmount += +accounts[i].initialBalance;
        }
      }
    }
    if (i === array.length - 1) {
      report.moneyInTheEnd.total = totalAmount;
    }
    array[i].totalAmount = totalAmount;
  }
};

accountSchema.statics.generateReportByAccounts = async function ({
  businessId,
  countPlanned,
  queryData,
}) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };

  const aggResult = await Account.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
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

  const report = getSkeletonForAccountReport(queryData);

  constructReportByAccount(aggResult, report, queryData);

  await Account.getMoneyInTheBeginning(businessId, countPlanned, report);
  await Account.getMoneyInTheEnd(businessId, countPlanned, report);
  calculateBalance(report);

  return report;
};

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
