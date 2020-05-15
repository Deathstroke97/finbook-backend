const moment = require("moment");
const Transaction = require("../models/transaction");
const Account = require("../models/account");

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
    const totalItems = await Transaction.find().countDocuments();
    let filters = {
      business: businessId,
      date: queryData.createTime,
      type: type,
      category: category,
      account: account,
      contractor: contractor,
      project: project,
      isPlanned:
        status == "completed" ? false : status == "planned" ? true : undefined,
    };
    const transactions = await Transaction.find({ ...filters })
      .populate("category", "account", "contractor", "project")
      .sort({ date: -1 });
    res.status(200).json({
      message: "Transactions fetched successfully.",
      transactions: transactions,
      totalItems: totalItems,
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
    isPlanned,
    isPeriodic,
    period,
    repetitionEndDate,
    isObligation,
  } = req.body;
  try {
    const acc = await Account.findById(account);
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
      relatedDate: relatedDate ? relatedDate : date,
      isPlanned,
      isPeriodic,
      period,
      repetitionEndDate,
      isObligation,
      accountBalance:
        type == "income" ? +acc.balance + +amount : +acc.balance - amount,
    });

    await transaction.save();

    let results = [transaction];
    if (new Date(date) <= new Date()) {
      acc.balance =
        type == "income" ? +acc.balance + +amount : +acc.balance - amount;
      await acc.save();
      if (isObligation) {
        await transaction.attachObligation();
      }
    }

    if (isPeriodic) {
      transaction.periodicChainId = transaction._id;
      await transaction.save();
      const transactions = await transaction.addPeriodicChain();
      results = [...results, ...transactions];
    }
    results = Transaction.amountToString(results);
    res.status(201).json({
      message: "Transaction created!",
      results: results,
      length: results.length,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
