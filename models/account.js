const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const moment = require("moment");
const axios = require("axios");
const Business = require("./business");
const { getGrossProfit, getProfitability } = require("../utils/project");

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
  report
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

accountSchema.statics.getMoneyInTheEnd = async function (
  businessId,
  countPlanned,
  report
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

accountSchema.statics.generateCashFlowByAccounts = async function (
  businessId,
  queryData,
  countPlanned
) {
  const filterPlanned = countPlanned ? {} : { "transactions.isPlanned": false };
  console.log("queryData: ", queryData);

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

    let exchangeRate = 1;
    if (account.currency != business.currency) {
      // const response = await axios.get(
      //   `https://free.currconv.com/api/v7/convert?q=${account.currency}_${business.currency}&compact=ultra&apiKey=763858c5637f159b8186`
      // );
      // exchangeRate = response.data[`${account.currency}_${business.currency}`];
      // exchangeRate = 1;
    }

    result.totalIncome.fact += exchangeRate * income;
    result.totalOutcome.fact += exchangeRate * outcome;
  }

  result.totalBalance.fact = result.totalIncome.fact - result.totalOutcome.fact;

  if (project) {
    result.totalIncome.plan = +project.planIncome;
    result.totalOutcome.plan = +project.planOutcome;
    result.totalBalance.plan =
      result.totalIncome.plan - result.totalOutcome.plan;
    // сalculating percentage values fact/plan
    //income
    if (+project.planIncome !== 0) {
      const percent = (
        (result.totalIncome.fact * 100) /
        result.totalIncome.plan
      ).toFixed(2);
      result.totalIncome.percent = percent > 100 ? 100 : +percent;
    }
    //outcome
    if (+project.planOutcome !== 0) {
      const percent = (
        (result.totalOutcome.fact * 100) /
        result.totalOutcome.plan
      ).toFixed(2);
      result.totalOutcome.percent = percent > 100 ? 100 : +percent;
    }
    //balance
    if (+project.planIncome - project.planOutcome !== 0) {
      const difference = +project.planIncome - project.planOutcome;
      const percent = (result.totalBalance.fact * 100) / difference;
      result.totalBalance.percent = percent > 100 ? 100 : +percent;
    }
    //profitability
    const grossProfit = getGrossProfit(result);
    result.profitability = getProfitability(grossProfit, project, result);
    if (+result.profitability.plan !== 0) {
      const percent =
        (result.profitability.fact * 100) / result.profitability.plan;
      result.profitability.percent = percent > 100 ? 100 : +percent;
    }
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
    let exchangeRate = 1;
    if (account.currency != business.currency) {
      // const response = await axios.get(
      //   // `https://free.currconv.com/api/v7/convert?q=${account.currency}_${business.currency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
      //   `https://free.currconv.com/api/v7/convert?q=${account.currency}_${business.currency}&compact=ultra&apiKey=763858c5637f159b8186`
      // );
      // exchangeRate = response.data[`${account.currency}_${business.currency}`];
      exchangeRate = 1;
      // const response = await axios.get(
      //   `https://www.amdoren.com/api/currency.php?api_key=w98H8acteFPKpE8j59udXq4NYxpciN&from=${account.currency}&to=${business.currency}`
      // );
      // exchangeRate = response.data.amount;
      // const response = await axios.get(
      //   // `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${account.currency}`
      //   `https://v6.exchangerate-api.com/v6/8295c1d86ef8d29305aa6aa2/latest/${account.currency}`
      // );
      // exchangeRate = response.data.conversion_rates[business.currency];
    }
    moneyInBusiness.total += exchangeRate * account.balance;
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
