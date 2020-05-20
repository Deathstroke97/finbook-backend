const moment = require("moment");
const Transaction = require("../models/transaction");
const Account = require("../models/account");
const { COMPLETED, PLANNED } = require("../constants");
const { OPERATION_INCOME } = require("../constants");

exports.getTransactions = async (req, res, next) => {
  const {
    businessId,
    queryData,
    type,
    category,
    account,
    contractor,
    project,
    status,
    currentPage,
    perPage,
  } = req.body;
  try {
    let query = {};
    if (businessId) query.business = businessId;
    if (queryData) query.date = queryData.createTime;
    if (type) query.type = type;
    if (category) query.category = category;
    if (account) query.account = account;
    if (contractor) query.contractor = contractor;
    if (project) query.project = project;
    if (status == COMPLETED) query.isPlanned = false;
    if (status == PLANNED) query.isPlanned = true;

    const transactions = await Transaction.find(query)
      .populate("account")
      .populate("project")
      .sort({ date: -1 });
    res.status(200).json({
      message: "Transactions fetched successfully.",
      transactions: transactions,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  const {
    businessId,
    date,
    type,
    category,
    project,
    contractor,
    amount,
    account,
    description,
    relatedDate,
    isPeriodic,
    period,
    repetitionEndDate,
    isObligation,
  } = req.body;
  try {
    const acc = await Account.findById(account);
    let amountLast = acc.balance;
    const lastTransaction = await Transaction.find({
      business: businessId,
      date: { $lte: new Date(date) },
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(1);
    if (lastTransaction.length > 0) {
      amountLast = parseFloat(lastTransaction[0].accountBalance);
    }

    const accountBalance =
      type === OPERATION_INCOME ? amountLast + +amount : amountLast - amount;
    const isPlanned = new Date(date) > new Date() ? true : false;

    const transaction = new Transaction({
      business: businessId,
      date,
      type,
      category,
      project,
      contractor,
      amount,
      account,
      description,
      relatedDate,
      isPlanned,
      isPeriodic,
      period,
      repetitionEndDate,
      isObligation,
      accountBalance,
    });
    await transaction.save();
    await transaction.updateTransactionsBalance(false);

    if (new Date(date) <= new Date()) {
      acc.balance =
        type == OPERATION_INCOME
          ? +acc.balance + +amount
          : +acc.balance - amount;
      await acc.save();
      if (isObligation) {
        await transaction.attachObligation();
      }
    }

    if (isPeriodic) {
      transaction.rootOfPeriodicChain = true;
      transaction.periodicChainId = transaction._id;
      await transaction.save();
      await transaction.addPeriodicChain(acc);
    }
    res.status(201).json({
      message: "Transaction created!",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  const transactionId = req.params.transactionId;
  const {
    businessId,
    date,
    category,
    project,
    contractor,
    amount,
    account,
    description,
    relatedDate,
    isPeriodic,
    period,
    repetitionEndDate,
    isObligation,
  } = req.body;

  const transaction = await Transaction.findById(transactionId);

  // transaction.category = category;
  // transaction.project = project;
  // transaction.contractor = contractor;
  // transaction.account = account;
  // transaction.description = description;
  // transaction.relatedDate = relatedDate;
  let transactions = [];

  if (new Date(transaction.date) !== new Date(date)) {
    let lowerBound, upperBound, range;

    if (new Date(transaction.date) < new Date(date)) {
      lowerBound = transaction.date;
      upperBound = date;
      transaction.date = date;

      await transaction.save();
      range = await Transaction.getRangeInAsc(
        businessId,
        account,
        transaction._id,
        lowerBound,
        upperBound
      );

      const updated = await Transaction.updateBalanceInRange(range);
      console.log("operations after updating: ");
      updated.forEach((element) => {
        console.log({
          date: new Date(element.date).toISOString(),
          amount: element.amount.toString(),
          accountBalance: element.accountBalance.toString(),
        });
      });
    } else {
      lowerBound = date;
      upperBound = transaction.date;
      transaction.date = date;
      await transaction.save();
      range = await Transaction.getRangeInAsc(
        businessId,
        account,
        transaction._id,
        lowerBound,
        upperBound
      );
      await Transaction.updateBalanceInRange(range);
    }
  }

  res.status(200).json({
    message: "Transaction updated.",
  });
};
