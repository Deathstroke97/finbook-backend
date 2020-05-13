const Account = require("../models/account");

exports.getAccounts = async (req, res, next) => {
  const businessId = req.body.businessId;
  try {
    const accounts = await Account.find({ business: businessId });
    res.status(200).json({
      message: "Accounts fetched.",
      accounts: accounts,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  const businessId = req.body.businessId;
  const {
    name,
    currency,
    number,
    bankName,
    initialAmount,
    initialAmountDate,
  } = req.body;
  const account = new Account({
    name,
    currency,
    number,
    bankName,
    amount: initialAmount,
    initialAmount: initialAmount,
    initialAmountDate,
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
  const { name, currency, number, bankName, amount } = req.body;

  try {
    const account = await Account.findById(accountId);
    if (!account) {
      const error = new Error("Could not find requested account.");
      error.statusCode = 404;
      throw error;
    }
    account.name = name;
    account.currency = currency;
    account.number = number;
    account.bankName = bankName;
    account.amount = amount;
    await account.save();
    res.status(200).json({
      message: "Account updated.",
      account: account,
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
    await Account.findByIdAndRemove(accountId);
    res.status(200).json({
      message: "account deleted. ",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
