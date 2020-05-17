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
    const lastTransaction = await Transaction.find({
      business: businessId,
      date: { $lte: new Date(date) },
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(1);
    const amountLast = parseFloat(lastTransaction[0].accountBalance);

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
    await Transaction.updateTransactionsBalance(transaction);
    let results = [transaction];

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
      transaction.periodicChainId = transaction._id;
      await transaction.save();
      await transaction.addPeriodicChain(acc);
      // results = [...results, ...transactions];
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
