const Account = require("../models/account");
const { transformToString } = require("../utils/functions");
const constants = require("../constants");
const Transaction = require("../models/transaction");

exports.getAccounts = async (req, res, next) => {
  const businessId = req.businessId;

  try {
    const accounts = await Account.find({ business: businessId });
    const totalItems = await Account.find().countDocuments();
    res.status(200).json({
      message: "Accounts fetched.",
      accounts: transformToString(accounts, constants.COLLECTION_TYPE_ACCOUNT),
      totalItems: totalItems,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  const businessId = req.businessId;
  const {
    name,
    type,
    currency,
    bankNumber,
    bankName,
    bik,
    initialBalance,
    initialBalanceDate,
  } = req.body;
  const account = new Account({
    name,
    type,
    currency,
    bankNumber,
    bankName,
    bik,
    initialBalance: initialBalance,
    balance: initialBalance,
    initialBalanceDate: initialBalanceDate,
    business: businessId,
  });
  try {
    await account.save();
    res.status(201).json({
      message: "Account created.",
      account: account,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  const accountId = req.params.accountId;
  const {
    name,
    currency,
    bankNumber,
    bankName,
    bik,
    initialBalance,
    initialBalanceDate,
  } = req.body;

  try {
    const account = await Account.findById(accountId);
    if (!account) {
      const error = new Error("Could not find requested account.");
      error.statusCode = 404;
      throw error;
    }
    account.name = name;
    account.currency = currency;
    account.bankNumber = bankNumber;
    account.bankName = bankName;
    account.initialBalanceDate = initialBalanceDate;

    if (+account.initialBalance !== +initialBalance) {
      const diff = +account.initialBalance - initialBalance;
      account.balance = +account.balance - diff;
      account.initialBalance = initialBalance;
      const transactions = await Transaction.find({ account: accountId }).sort({
        date: 1,
        createdAt: 1,
      });
      for (const transaction of transactions) {
        transaction.accountBalance = +transaction.amount + +initialBalance;
        await transaction.save();
      }
    }

    await account.save();
    res.status(200).json({
      message: "Account updated.",
      account: transformToString([account], constants.COLLECTION_TYPE_ACCOUNT),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  const accountId = req.params.accountId;
  try {
    const account = await Account.findById(accountId);
    if (!account) {
      const error = new Error("Could not find requested account.");
      error.statusCode = 404;
      throw error;
    }
    Transaction.find({ account: accountId })
      .cursor()
      .on("data", async function (transaction) {
        await Transaction.findByIdAndRemove(transaction._id);
      })
      .on("end", async function () {
        await Account.findByIdAndRemove(accountId);
        res.status(200).json({
          message: "account deleted. ",
        });
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
