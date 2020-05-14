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
  });

  try {
    const newTransaction = await transaction.save();

    let results = [newTransaction];
    if (isObligation && new Date(date) <= new Date()) {
      await newTransaction.attachObligation();
    }
    if (isPeriodic) {
      newTransaction.periodicChainId = newTransaction._id;
      await newTransaction.save();
      const transactions = await newTransaction.addPeriodicChain();
      results = [...results, ...transactions];
    }
    const acc = await Account.findById(account);
    console.log("results: ", results);
    results = Transaction.amountToString(results);
    await acc.updateBalance(results);
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
