const moment = require("moment");
const Transaction = require("../models/transaction");
const Account = require("../models/account");
const Obligation = require("../models/obligation");
const Contractor = require("../models/contractor");

const constants = require("../constants");
const { transform } = require("../utils/functions");
const { OPERATION_INCOME } = require("../constants");

exports.getTransactions = async (req, res, next) => {
  const businessId = req.businessId;
  const {
    queryData,
    type,
    category,
    account,
    contractor,
    project,
    status,
    page,
    rowsPerPage,
  } = req.body;
  try {
    let query = {};
    if (businessId) query.business = businessId;
    if (queryData.createTime.$gte && queryData.createTime.$lte) {
      query.date = queryData.createTime;
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (account) query.account = account;
    if (contractor) query.contractor = contractor;
    if (project) query.project = project;
    if (status == constants.COMPLETED) query.isPlanned = false;
    if (status == constants.PLANNED) query.isPlanned = true;

    const overallNumbers = await Account.getOverallNumbers(
      businessId,
      null,
      queryData.createTime.$gte,
      queryData.createTime.$lte
    );

    const moneyInBusiness = await Account.getMoneyInBusiness(businessId);
    console.log("query: ", query);

    const totalItems = await Transaction.find(query).countDocuments();

    const transactions = await Transaction.find(query)
      .populate("account")
      .populate("project")
      .populate("category")
      .populate("contractor")
      .sort({ date: -1, createdAt: -1 })
      .skip(page * rowsPerPage)
      .limit(rowsPerPage);

    res.status(200).json({
      message: "Transactions fetched successfully.",
      transactions: transform(transactions, "transaction"),
      overallNumbers: overallNumbers,
      moneyInBusiness: moneyInBusiness,
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
  const { body } = req;
  const businessId = req.businessId;
  const { date, type, amount, account } = req.body;

  try {
    const acc = await Account.findById(account);
    let amountLast = +acc.balance;

    const startTransaction = await Transaction.find({
      business: businessId,
      account: account,
      date: { $lte: date },
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(1);
    if (startTransaction.length > 0) {
      amountLast = parseFloat(startTransaction[0].accountBalance);
    }
    if (startTransaction.length === 0) {
      amountLast = +acc.initialBalance;
    }

    const accountBalance =
      type === constants.OPERATION_INCOME
        ? amountLast + +amount
        : amountLast - amount;

    const isPlanned = moment(date) > moment() ? true : false;

    const transaction = new Transaction({
      business: businessId,
      date: body.date,
      isPlanned: isPlanned,
      type: body.type,
      category: body.category ? body.category : null,
      project: body.project ? body.project : null,
      contractor: body.contractor ? body.contractor : null,
      amount: body.amount,
      account: body.account,
      description: body.description ? body.description : null,
      relatedDate: body.relatedDate ? body.relatedDate : body.date,
      isObligation: body.isObligation,
      accountBalance: accountBalance,
      isPeriodic: body.isPeriodic,
      period: body.period && body.period,
      repetitionEndDate: body.repetitionEndDate && body.repetitionEndDate,
    });
    await transaction.save();
    await transaction.updateTransactionsBalanceOnCreate();

    if (!isPlanned) {
      if (type === constants.OPERATION_INCOME) {
        acc.balance = +acc.balance + +amount;
      }
      if (type === constants.OPERATION_OUTCOME) {
        acc.balance = +acc.balance - amount;
      }
      await acc.save();
      if (body.isObligation) {
        await transaction.attachObligation();
      }
    }

    if (body.isPeriodic && body.period) {
      transaction.rootOfPeriodicChain = true;
      transaction.periodicChainId = transaction._id;
      await transaction.save();
      await transaction.addPeriodicChain(acc._id);
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
  const {
    id,
    date,
    relatedDate,
    amount,
    account,
    project,
    description,
    contractor,
    category,
    isObligation,
    isPeriodic,
    period,
    repetitionEndDate,
  } = req.body;

  try {
    const transaction = await Transaction.findById(id);

    if (transaction.account && account) {
      if (transaction.account.toString() !== account) {
        await transaction.updateAccount(account);
      }
    }

    if (transaction.contractor && contractor) {
      if (transaction.contractor.toString() !== contractor) {
        await transaction.updateContractor(contractor);
      }
    }

    if (parseFloat(transaction.amount).toFixed(2) != amount) {
      console.log("99999", parseFloat(transaction.amount).toFixed(2));
      await transaction.updateAmount(amount);
    }

    const transactionDate = moment(transaction.date).format("YYYY-MM-DD");
    if (transactionDate !== date) {
      console.log("1: ", transactionDate);
      console.log("2: ", date);
      await transaction.updateDate(date);
    }

    if (!isObligation && transaction.isObligation) {
      await transaction.updateIsObligation(!isObligation, contractor);
    }

    if (isObligation && !transaction.isObligation) {
      await transaction.updateIsObligation(isObligation, contractor);
    }

    if (period !== transaction.period) {
      await transaction.updatePeriod();
    }

    if (isPeriodic && !transaction.isPeriodic) {
      await transaction.updateIsPeriodic(isPeriodic);
    }

    if (!isPeriodic && transaction.isPeriodic) {
      await transaction.updateIsPeriodic(!isPeriodic);
    }

    transaction.description = description;
    transaction.relatedDate = relatedDate;
    transaction.repetitionEndDate = repetitionEndDate;
    transaction.category = category;
    transaction.project = project;
    transaction.account = account;
    transaction.contractor = contractor;

    await transaction.save();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
  res.status(200).json({
    message: "Transaction updated.",
  });
};

exports.deleteTransaction = async (req, res, next) => {
  const transactionId = req.params.transactionId;

  try {
    const transaction = await Transaction.findById(transactionId);
    const account = await Account.findById(transaction.account);

    if (transaction) {
      if (transaction.isObligation && !transaction.isPlanned) {
        const contractor = await Contractor.findById(transaction.contractor);
        if (contractor) {
          if (transaction.type === constants.OPERATION_INCOME) {
            contractor.balance = +contractor.balance - transaction.amount;
          }
          if (transaction.type === constants.OPERATION_OUTCOME) {
            contractor.balance = +contractor.balance + +transaction.amount;
          }
          await contractor.save();
          await Obligation.findByIdAndRemove(transaction.obligationId);
        }
      }

      if (!transaction.isPlanned) {
        if (transaction.type === constants.OPERATION_INCOME) {
          account.balance = +account.balance - transaction.amount;
        }
        if (transaction.type === constants.OPERATION_OUTCOME) {
          account.balance = +account.balance + +transaction.amount;
        }
        await account.save();
      }
      const diff = 0 - transaction.amount;
      await transaction.updateTransactionsBalance(diff, account);
      await Transaction.findByIdAndRemove(transactionId);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
  res.status(200).json({
    message: "Transaction deleted.",
  });
};

exports.cancelRepetition = async (req, res, next) => {
  const periodicChainId = req.body.periodicChainId;
  try {
    await Transaction.deleteMany({
      periodicChainId: periodicChainId,
      isPlanned: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
  res.status(200).json({
    message: "Transaction repetition cancelled.",
  });
};
