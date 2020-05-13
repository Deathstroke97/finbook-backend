const Transfer = require("../models/transfer");
const Account = require("../models/account");

exports.getTransfers = async (req, res, next) => {
  const businessId = req.body.businessId;
  try {
    const transfers = await Transfer.find({ business: businessId });
    res.status(200).json({
      message: "transfers fetched.",
      transfers: transfers,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createTransfer = async (req, res, next) => {
  const businessId = req.body.businessId;
  const {
    exchangeRate,
    amount,
    description,
    fromBankAccount,
    toBankAccount,
    date,
  } = req.body;

  try {
    const fromAccount = await Account.findById(fromBankAccount);
    fromAccount.amount = +fromAccount.amount - amount;
    await fromAccount.save();
    const toAccount = await Account.findById(toBankAccount);
    toAccount.amount = +toAccount.amount + exchangeRate * amount;
    await toAccount.save();

    const transfer = new Transfer({
      exchangeRate,
      amount,
      fromBankAccount,
      toBankAccount,
      date,
      description,
      business: businessId,
    });

    await transfer.save();
    res.status(201).json({
      message: "transfer created.",
      transfer: transfer,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateTransfer = async (req, res, next) => {
  const transferId = req.params.transferId;
  const {
    exchangeRate,
    amount,
    description,
    fromBankAccount,
    toBankAccount,
    date,
  } = req.body;

  try {
    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      const error = new Error("Could not find requested transfer.");
      error.statusCode = 404;
      throw error;
    }

    const fromAccount = await Account.findById(fromBankAccount);
    fromAccount.amount = +fromAccount.amount + +transfer.amount - amount;
    await fromAccount.save();
    const toAccount = await Account.findById(toBankAccount);
    toAccount.amount =
      +toAccount.amount -
      transfer.amount * transfer.exchangeRate +
      amount * exchangeRate;
    await toAccount.save();

    transfer.exchangeRate = exchangeRate;
    transfer.amount = amount;
    transfer.fromBankAccount = fromBankAccount;
    transfer.toBankAccount = toBankAccount;
    transfer.date = date;
    transfer.description = description;
    await transfer.save();
    res.status(200).json({
      message: "transfer updated.",
      transfer: transfer,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteTransfer = async (req, res, next) => {
  const transferId = req.params.transferId;
  try {
    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      const error = new Error("Could not find requested transfer.");
      error.statusCode = 404;
      throw error;
    }

    const fromAccount = await Account.findById(transfer.fromBankAccount);
    fromAccount.amount = +fromAccount.amount + +transfer.amount;
    await fromAccount.save();
    const toAccount = await Account.findById(transfer.toBankAccount);
    toAccount.amount =
      +toAccount.amount - transfer.amount * transfer.exchangeRate;
    await toAccount.save();

    await Transfer.findByIdAndRemove(transferId);
    res.status(200).json({
      message: "transfer deleted. ",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
