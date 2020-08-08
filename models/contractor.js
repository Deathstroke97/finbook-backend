const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const axios = require("axios");
const Account = require("./account");
const moment = require("moment");
const Obligation = require("./obligation");

const { populateWithBuckets, calculateBalance } = require("../utils/functions");
const {
  getSkeletonForContractorReport,
  constructReportByContractor,
  getEmptyContractorTransactions,
} = require("../utils/contractor");
const constants = require("../constants");

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
    contactName: String,
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

contractorSchema.statics.generateCashFlowByContractor = async function ({
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

contractorSchema.statics.getNumbers = async function (contractorId) {
  const Transaction = mongoose.model("Transaction");
  const transactions = await Transaction.find({ contractor: contractorId });

  const incomeOperations = transactions.filter(
    (transaction) => transaction.type === constants.OPERATION_INCOME
  );
  const outcomeOperations = transactions.filter(
    (transaction) => transaction.type === constants.OPERATION_OUTCOME
  );

  const incomesWithObligation = incomeOperations.filter(
    (operation) => operation.isObligation === true
  );
  const outcomesWithObligation = outcomeOperations.filter(
    (operation) => operation.isObligation === true
  );
  const initialValue = 0;

  const incomeTotal = incomeOperations.reduce(
    (accumulator, currentValue) => accumulator + +currentValue.amount,
    initialValue
  );
  const outcomeTotal = outcomeOperations.reduce(
    (accumulator, currentValue) => accumulator + +currentValue.amount,
    initialValue
  );

  const incomesWithObligationTotal = incomesWithObligation.reduce(
    (accumulator, currentValue) => accumulator + +currentValue.amount,
    initialValue
  );
  const outcomesWithObligationTotal = outcomesWithObligation.reduce(
    (accumulator, currentValue) => accumulator + +currentValue.amount,
    initialValue
  );
  let exchangeRate = 1;
  if (account.currency != business.currency) {
    // const response = await axios.get(
    //   `https://free.currconv.com/api/v7/convert?q=${account.currency}_${business.currency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
    // );
    // exchangeRate = response.data[`${account.currency}_${business.currency}`];
    // const response = await axios.get(
    //   `https://www.amdoren.com/api/currency.php?api_key=w98H8acteFPKpE8j59udXq4NYxpciN&from=${account.currency}&to=${business.currency}`
    // );
    // exchangeRate = response.data.amount;
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${account.currency}`
    );
    exchangeRate = response.data.conversion_rates[business.currency];
  }

  return {
    incomeTotal,
    outcomeTotal,
    balance: incomesWithObligationTotal - outcomesWithObligationTotal,
  };
};

contractorSchema.statics.getOverallNumbers = async function (
  businessId,
  contractorId,
  startTime,
  endTime
) {
  const Account = mongoose.model("Account");
  const Business = mongoose.model("Business");

  let transactionDates = {};
  if (startTime && endTime) {
    transactionDates = {
      "transactions.date": {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    };
  }

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
        ...transactionDates,
        "transactions.isPlanned": false,
        "transactions.contractor": ObjectId(contractorId),
        // "transactions.isObligation": false,
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

  const result = {
    totalIncome: 0,
    totalOutcome: 0,
  };
  const business = await Business.findById(businessId);

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

    result.totalIncome += exchangeRate * income;
    result.totalOutcome += exchangeRate * outcome;
  }

  return result;
};

contractorSchema.statics.getBalance = async function (
  businessId,
  contractorId
) {
  const Account = mongoose.model("Account");
  const Business = mongoose.model("Business");
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
        "transactions.isPlanned": false,
        "transactions.contractor": ObjectId(contractorId),
        "transactions.isObligation": true,
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
    totabalance: 0,
  };
  const business = await Business.findById(businessId);

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
  transactions.totabalance =
    (transactions.totalIncome - transactions.totalOutcome) * -1;
  const obligationsBalance = await Obligation.getBalance(
    businessId,
    contractorId
  );
  return transactions.totabalance + obligationsBalance;
};
const Contractor = mongoose.model("Contractor", contractorSchema);

module.exports = Contractor;
