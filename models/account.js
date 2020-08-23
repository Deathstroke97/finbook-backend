const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const moment = require("moment");
const axios = require("axios");
const Business = require("./business");
const { getGrossProfit, getProfitability } = require("../utils/project");

const {
  populateWithBuckets,
  calculateBalance,
  convertToBusinessCurrency,
  getExchageRate,
  getConversionRates,
} = require("../utils/functions");
const {
  getSkeletonForAccountReport,
  constructReportByAccount,
} = require("../utils/account");

const { calculateProjectDetails } = require("../utils/project");

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
    enum: ["RUB", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],
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

accountSchema.statics.getMoneyInTheBeginning = async function (
  businessId,
  countPlanned,
  report,
  conversionRates
) {
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
          accountBalance =
            parseFloat(transaction[0].accountBalance) *
            conversionRates[transaction[0].account];
          totalAmount += accountBalance;
        } else {
          if (date >= moment(accounts[i].initialBalanceDate)) {
            totalAmount +=
              +accounts[i].initialBalance *
              conversionRates[accounts[i].currency];
          }
        }
      }
      array[i].totalAmount = totalAmount;
    });
  }
};

accountSchema.statics.getMoneyInTheEnd = async function (
  businessId,
  countPlanned,
  report,
  conversionRates
) {
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
        accountBalance =
          parseFloat(transaction[0].accountBalance) *
          conversionRates[transaction[0].account];
        totalAmount += accountBalance;
      } else {
        if (date >= moment(accounts[i].initialBalanceDate)) {
          totalAmount +=
            +accounts[i].initialBalance * conversionRates[accounts[i].currency];
        }
      }
    }
    if (i === array.length - 1) {
      report.moneyInTheEnd.total = totalAmount;
    }
    array[i].totalAmount = totalAmount;
  }
};

accountSchema.statics.generateCashFlowByAccounts = async function (
  businessId,
  queryData,
  countPlanned
) {
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
        currency: { $first: "$currency" },
        total: { $sum: "$transactions.amount" },
        operations: { $push: "$transactions" },
      },
    },
    {
      $project: {
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

  const report = getSkeletonForAccountReport(queryData);

  const accounts = await Account.find({ business: businessId });
  const business = await Business.findById(businessId);
  const conversionRates = await getConversionRates(accounts, business.currency);
  constructReportByAccount(aggResult, report, queryData, conversionRates);

  await Account.getMoneyInTheBeginning(
    businessId,
    countPlanned,
    report,
    conversionRates
  );
  await Account.getMoneyInTheEnd(
    businessId,
    countPlanned,
    report,
    conversionRates
  );
  calculateBalance(report);

  return report;
};

accountSchema.statics.getOverallNumbers = async function (
  businessId,
  account,
  project,
  startTime,
  endTime
) {
  let transactionDates = {};
  if (startTime && endTime) {
    transactionDates = {
      "transactions.date": {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    };
  }
  const projectInfo = project
    ? { "transactions.project": ObjectId(project._id) }
    : {};
  const accountInfo = account
    ? { "transactions.account": ObjectId(account) }
    : {};

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
        // "transactions.date": {
        //   $gte: new Date(startTime),
        //   $lte: new Date(endTime),
        // },
        ...transactionDates,
        "transactions.isPlanned": false,
        ...projectInfo,
        ...accountInfo,
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
      $group: {
        _id: { account: "$name" },
        currency: { $first: "$currency" },
        balance: { $first: "$balance" },
        operations: { $push: "$transactions" },
      },
    },
    {
      $project: {
        currency: 1,
        balance: 1,
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

  const result = {
    totalIncome: {
      fact: 0,
      plan: 0,
      percent: 0,
    },
    totalOutcome: {
      fact: 0,
      plan: 0,
      percent: 0,
    },
    totalBalance: {
      fact: 0,
      plan: 0,
      percent: 0,
    },
    profitability: {
      fact: 0,
      plan: 0,
      percent: 0,
    },
  };
  const business = await Business.findById(businessId);

  for (const account of aggResult) {
    let income = 0;
    let outcome = 0;
    account.incomeOperations.forEach((operation) => {
      income += +operation.amount;
    });
    account.outcomeOperations.forEach((operation) => {
      outcome += +operation.amount;
    });
    const exchangeRate = await getExchageRate(account, business);
    result.totalIncome.fact += exchangeRate * income;
    result.totalOutcome.fact += exchangeRate * outcome;
  }

  result.totalBalance.fact = result.totalIncome.fact - result.totalOutcome.fact;

  if (project) {
    calculateProjectDetails(result, project);
  }
  return result;
};

accountSchema.statics.getMoneyInBusiness = async function (businessId) {
  const moneyInBusiness = {
    total: 0,
    accounts: [],
  };
  const business = await Business.findById(businessId);
  const accounts = await Account.find({ business: ObjectId(businessId) });

  for (const account of accounts) {
    const converted = await convertToBusinessCurrency(account, business);
    moneyInBusiness.total += converted;
    moneyInBusiness.accounts.push({
      name: account.name,
      balance: +account.balance,
      currency: account.currency,
    });
  }
  return moneyInBusiness;
};

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
