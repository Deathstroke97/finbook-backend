const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const Obligation = require("./obligation");

const Contractor = require("./contractor");

const constants = require("../constants");

const transactionSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    contractor: {
      type: Schema.Types.ObjectId,
      ref: "Contractor",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "outcome"],
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    relatedDate: {
      type: Date,
    },
    isPlanned: {
      type: Boolean,
      default: false,
    },
    isPeriodic: {
      type: Boolean,
      default: false,
    },
    rootOfPeriodicChain: {
      type: Boolean,
      default: false,
    },
    period: {
      type: String,
      // enum: ["week", "month", "twoMonth", "quarter", "halfYear", "year"],
    },
    periodicChainId: Schema.Types.ObjectId,
    repetitionEndDate: Date,
    isObligation: {
      type: Boolean,
      default: false,
    },
    obligationId: Schema.Types.ObjectId,
    accountBalance: {
      type: Schema.Types.Decimal128,
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.methods.attachObligation = async function () {
  const Account = require("./account");

  const account = await Account.findById(this.account);
  const contractor = await Contractor.findById(this.contractor);

  if (contractor) {
    if (this.type === constants.OPERATION_INCOME) {
      contractor.balance = +contractor.balance - this.amount;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      contractor.balance = +contractor.balance + +this.amount;
    }
    await contractor.save();
  }

  const obligation = new Obligation({
    business: this.business,
    date: this.date,
    amount: this.amount,
    type: this.type == constants.OPERATION_INCOME ? "in" : "out",
    contractor: this.contractor,
    currency: account.currency,
    transaction: this._id,
  });
  await obligation.save();
  this.obligationId = obligation._id;
  return this.save();
};

transactionSchema.methods.addPeriodicChain = async function (accountId) {
  const Account = mongoose.model("Account");
  const account = await Account.findById(accountId);
  let beginDate = moment(this.date).valueOf();
  let endDate = moment(this.repetitionEndDate).valueOf();
  let period = "";
  let actualAccountBalance = +account.balance;
  switch (this.period) {
    case constants.PERIOD_WEEK:
      period = moment.duration(7, "days").valueOf();
      break;
    case constants.PERIOD_MONTH:
      period = moment.duration(1, "month").valueOf();
      break;
    case constants.PERIOD_TWO_MONTH:
      period = moment.duration(2, "months").valueOf();
      break;
    case constants.PERIOD_QUARTER:
      period = moment.duration(1, "quarter").valueOf();
      break;
    case constants.PERIOD_HALF_YEAR:
      period = moment.duration(6, "months").valueOf();
      break;
    case constants.PERIOD_YEAR:
      period = moment.duration(1, "year").valueOf();
      break;
    default:
      return;
  }
  beginDate += period;
  try {
    while (beginDate <= endDate) {
      const Transaction = mongoose.model("Transaction", transactionSchema);
      const lastTransaction = await Transaction.find({
        date: { $lte: new Date(beginDate) },
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(1);
      const amountLast = parseFloat(lastTransaction[0].accountBalance);
      const accountBalance =
        this.type === constants.OPERATION_INCOME
          ? amountLast + +this.amount
          : amountLast - this.amount;

      const transaction = new Transaction({
        business: this.business,
        account: this.account,
        contractor: this.contractor,
        category: this.category,
        project: this.project,
        amount: this.amount,
        type: this.type,
        description: this.description,
        date: new Date(beginDate),
        relatedDate: new Date(beginDate),
        isPlanned: new Date(beginDate) > new Date(),
        isPeriodic: this.isPeriodic,
        period: this.period,
        periodicChainId: this._id,
        isObligation: this.isObligation,
        repetitionEndDate: this.repetitionEndDate,
        accountBalance: accountBalance,
      });
      if (new Date(beginDate) <= new Date()) {
        if (this.isObligation) {
          await transaction.attachObligation();
        }

        actualAccountBalance =
          this.type == constants.OPERATION_INCOME
            ? actualAccountBalance + +this.amount
            : actualAccountBalance - this.amount;
      } else {
        await transaction.save();
      }
      beginDate += period;
    }
    if (+account.balance !== actualAccountBalance) {
      account.balance = actualAccountBalance;
      await account.save();
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Failed to add periodic chain.";
    }
  }
};

transactionSchema.statics.amountToString = function (transactions) {
  transactions = transactions.map((transaction) => {
    return {
      ...transaction._doc,
      amount: transaction.amount.toString(),
    };
  });
  return transactions;
};

transactionSchema.methods.updateTransactionsBalanceOnCreate = async function () {
  try {
    const Transaction = mongoose.model("Transaction", transactionSchema);
    const transactions = await Transaction.find({
      business: this.business,
      account: this.account,
      date: { $gt: this.date },
    });
    let promises = [];
    if (transactions.length > 0) {
      if (this.type === constants.OPERATION_INCOME) {
        promises = transactions.map(async (operation) => {
          operation.accountBalance = +operation.accountBalance + +this.amount;
          return operation.save();
        });
      } else {
        promises = transactions.map(async (operation) => {
          operation.accountBalance = +operation.accountBalance - this.amount;
          return operation.save();
        });
      }
      return Promise.all(promises);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Failed to update transactions's balance.";
    }
    throw error;
  }
};

transactionSchema.statics.getRangeInAsc = async function (
  businessId,
  accountId,
  transactionId,
  lowerBound,
  upperBound
) {
  try {
    const Transaction = mongoose.model("Transaction", transactionSchema);
    const Account = require("./account");
    let startTransaction = await Transaction.find({
      business: businessId,
      account: accountId,
      date: { $lte: lowerBound },
      _id: { $ne: transactionId },
    })
      .sort({ date: -1, createdAt: 1 })
      .limit(1);

    if (startTransaction.length === 0) {
      const account = await Account.findById(accountId);
      const transaction = await Transaction.find({
        business: businessId,
        account: accountId,
      })
        .sort({ date: 1, createdAt: 1 })
        .limit(1);
      if (transaction[0].type == constants.OPERATION_INCOME) {
        transaction[0].accountBalance =
          +transaction[0].amount + +account.initialBalance;
      } else {
        transaction[0].accountBalance =
          transaction[0].amount - account.initialBalance;
      }
      await transaction[0].save();
      startTransaction.push(transaction[0]);
    }

    const range = await Transaction.find({
      business: businessId,
      account: accountId,
      date: {
        $gte: startTransaction[0].date,
        $lte: upperBound,
      },
    }).sort({ date: 1, createdAt: 1 });
    return range;
  } catch (error) {
    console.log("error:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Failed to get range in getRangeInAsc function.";
    }
    throw error;
  }
};

transactionSchema.statics.updateBalanceInRange = async function (range) {
  try {
    let lastBalance = range[0].accountBalance;
    range = range.slice(1);
    const promises = range.map(async (operation) => {
      if (operation.type == constants.OPERATION_INCOME) {
        operation.accountBalance = +operation.amount + +lastBalance;
        lastBalance = operation.accountBalance;
        return operation.save();
      } else {
        operation.accountBalance = +lastBalance - operation.amount;
        lastBalance = operation.accountBalance;
        return operation.save();
      }
    });
    return Promise.all(promises);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Failed to update balance in range.";
    }
    throw error;
  }
};

transactionSchema.methods.updateTransactionsBalance = async function (
  diff,
  account
) {
  try {
    const Transaction = mongoose.model("Transaction", transactionSchema);

    const filter = {
      business: this.business,
      account: account,
    };
    const transactions = await Transaction.find({
      $or: [
        {
          ...filter,
          date: { $eq: this.date },
          createdAt: { $gte: this.createdAt },
        },
        {
          ...filter,
          date: { $gt: this.date },
        },
      ],
    });

    let promises = [];

    if (this.type === constants.OPERATION_INCOME) {
      promises = transactions.map(async (transaction) => {
        transaction.accountBalance = +transaction.accountBalance + diff;
        if (!transaction.isPlanned) {
          account.balance = transaction.accountBalance;
          console.log("acc.balance2: ", +account.balance);
        }
        return transaction.save();
      });
    } else {
      promises = transactions.map(async (transaction) => {
        transaction.accountBalance = +transaction.accountBalance - diff;
        if (!transaction.isPlanned) {
          account.balance = transaction.accountBalance;
        }
        return transaction.save();
      });
    }
    await account.save();
    return Promise.all(promises);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

transactionSchema.methods.updateContractor = async function (contractor) {
  if (this.isObligation && !this.isPlanned) {
    const obligation = await Obligation.findById(this.obligationId);
    obligation.contractor = contractor;
    await obligation.save();

    const oldContractor = await Contractor.findById(this.contractor);

    if (this.type === constants.OPERATION_INCOME) {
      oldContractor.balance = +oldContractor.balance + +this.amount;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      oldContractor.balance = +oldContractor.balance - this.amount;
    }
    await oldContractor.save();
    const newContractor = await Contractor.findById(contractor);
    if (this.type === constants.OPERATION_INCOME) {
      newContractor.balance = +newContractor.balance - this.amount;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      newContractor.balance = +newContractor.balance + +this.amount;
    }
    await newContractor.save();
    this.contractor = contractor;
  }
};

transactionSchema.methods.updateAccount = async function (account) {
  const Account = mongoose.model("Account");

  const fromAccount = await Account.findById(this.account);
  const toAccount = await Account.findById(account);

  this.updateTransactionsBalance(this.amount, fromAccount._id);
  this.updateTransactionsBalance(this.amount, toAccount._id);
  this.account = account;
};

transactionSchema.methods.updateAmount = async function (amount) {
  if (this.isObligation && !this.isPlanned) {
    const obligation = await Obligation.findById(this.obligationId);
    obligation.amount = amount;
    await obligation.save();
    const contractor = await Contractor.findById(this.contractor);
    if (this.type === constants.OPERATION_INCOME) {
      contractor.balance = +contractor.balance + +this.amount - amount;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      contractor.balance = +contractor.balance - this.amount + +amount;
    }
    await contractor.save();
  }
  const diff = +amount - this.amount;
  // this.date = date;
  this.amount = amount;
  // await this.save();
  await this.updateTransactionsBalance(diff, this.account);
};

transactionSchema.methods.updateDate = async function (date) {
  const Transaction = mongoose.model("Transaction", transactionSchema);
  let lowerBound, upperBound, range;
  if (moment(this.date) < moment(date)) {
    this.isPlanned = true;
    lowerBound = this.date;
    upperBound = date;
  } else {
    lowerBound = date;
    upperBound = this.date;
  }
  this.date = date;
  // await this.save();
  range = await Transaction.getRangeInAsc(
    this.business,
    this.account,
    this._id,
    lowerBound,
    upperBound
  );
  await Transaction.updateBalanceInRange(range);
};

transactionSchema.methods.updateObligation = async function (
  isObligation,
  contractorId
) {
  if (!isObligation && this.isObligation) {
    this.isObligation = false;
    if (moment(this.date) < moment()) {
      if (!this.isPlanned) {
        const contractor = await Contractor.findById(contractorId);
        if (this.type === constants.OPERATION_INCOME) {
          contractor.balance = +contractor.balance + +this.amount;
        }
        if (this.type === constants.OPERATION_OUTCOME) {
          contractor.balance = +contractor.balance - this.amount;
        }
        await contractor.save();
        await Obligation.findByIdAndRemove(this.obligationId);
      }
    }
  }
  if (isObligation && !this.isObligation) {
    this.isObligation = true;
    if (moment(this.date) < moment()) {
      await this.attachObligation();
    }
  }
};

transactionSchema.methods.updatePeriod = async function (period) {
  const Transaction = mongoose.model("Transaction");
  await Transaction.deleteMany({
    periodicChainId: this._id,
    isPlanned: true,
  });
  this.period = period;
  // await this.save();
  await this.addPeriodicChain(this.account);
};

transactionSchema.methods.updateIsPeriodic = async function (isPeriodic) {
  const Transaction = mongoose.model("Transaction");
  if (isPeriodic && !this.isPeriodic) {
    this.isPeriodic = true;
    this.rootOfPeriodicChain = true;
    this.periodicChainId = this._id;
    // await this.save();
    await this.addPeriodicChain(account);
  }
  if (!isPeriodic && this.isPeriodic) {
    this.isPeriodic = false;
    await Transaction.deleteMany({
      periodicChainId: this._id,
      isPlanned: true,
    });
  }
};

module.exports = mongoose.model("Transaction", transactionSchema);
