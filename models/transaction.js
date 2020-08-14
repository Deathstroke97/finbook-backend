const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const Obligation = require("./obligation");

const Contractor = require("./contractor");

const constants = require("../constants");
const Account = require("./account");

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
      default: 0,
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
      const transaction = new Transaction({
        business: this.business,
        account: this.account,
        contractor: this.contractor,
        category: this.category,
        project: this.project,
        amount: this.amount,
        type: this.type,
        description: this.description,
        date: moment(beginDate).format("YYYY-MM-DD"),
        relatedDate: moment(beginDate).format("YYYY-MM-DD"),
        isPlanned:
          moment(beginDate).format("YYYY-MM-DD") >
          moment().format("YYYY-MM-DD"),
        isPeriodic: this.isPeriodic,
        period: this.period,
        periodicChainId: this._id,
        isObligation: this.isObligation,
        repetitionEndDate: this.repetitionEndDate,
        accountBalance: 0,
      });
      if (
        moment(beginDate).format("YYYY-MM-DD") <= moment().format("YYYY-MM-DD")
      ) {
        if (this.isObligation) {
          await transaction.attachObligation();
        }
        if (this.type === constants.OPERATION_INCOME) {
          actualAccountBalance = actualAccountBalance + +this.amount;
        }
        if (this.type === constants.OPERATION_OUTCOME) {
          actualAccountBalance = actualAccountBalance - this.amount;
        }
      }
      await transaction.save();
      beginDate += period;
    }
    if (+account.balance !== actualAccountBalance) {
      account.balance = actualAccountBalance;
      await account.save();
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = error.message;
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
    const Account = mongoose.model("Account");
    const account = await Account.findById(this.account);

    let amountLast = +account.balance;
    let accountBalance = +account.balance;

    if (!this.isPlanned) {
      if (this.type === constants.OPERATION_INCOME) {
        account.balance = +account.balance + +this.amount;
      }
      if (this.type === constants.OPERATION_OUTCOME) {
        account.balance = +account.balance - this.amount;
      }
      await account.save();
      if (this.isObligation) {
        await this.attachObligation();
      }
    }

    const startTransaction = await Transaction.find({
      business: this.business,
      account: this.account,
      date: { $lte: this.date },
      createdAt: { $lt: this.createdAt },
      //createdAt нужен так как запись уже в базе, нельзя чтобы он был startTransaction
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(1);

    if (startTransaction.length === 0) {
      amountLast = +account.initialBalance;
      accountBalance = +account.initialBalance;
    }

    if (startTransaction.length > 0) {
      amountLast = parseFloat(startTransaction[0].accountBalance);
    }
    if (this.type === constants.OPERATION_INCOME) {
      accountBalance = amountLast + +this.amount;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      accountBalance = amountLast - this.amount;
    }
    this.accountBalance = accountBalance;

    await this.save();

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
      error.message = error.message;
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

  this.updateTransactionsBalance(this.amount, fromAccount);
  this.updateTransactionsBalance(this.amount, toAccount);
  this.account = account;
};

transactionSchema.methods.updateAmount = async function (amount) {
  const Account = mongoose.model("Account");
  const account = await Account.findById(this.account);
  const diff = +amount - this.amount;

  if (this.type === constants.OPERATION_INCOME) {
    this.accountBalance = +this.accountBalance + +diff;
  }
  if (this.type === constants.OPERATION_OUTCOME) {
    this.accountBalance = +this.accountBalance - diff;
  }

  if (!this.isPlanned) {
    if (this.type === constants.OPERATION_INCOME) {
      account.balance = +account.balance + +diff;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      account.balance = +account.balance - diff;
    }
    await account.save();
    if (this.isObligation) {
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
  }
  this.amount = amount;
  await this.updateTransactionsBalance(diff, account);
};

transactionSchema.methods.getRangeInAsc = async function (
  lowerBound,
  upperBound
) {
  try {
    const Transaction = mongoose.model("Transaction", transactionSchema);
    const Account = mongoose.model("Account");

    const startTransaction = await Transaction.find({
      business: this.business,
      account: this.account,
      date: { $lt: lowerBound },
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(1);

    if (startTransaction.length === 0) {
      const range = await Transaction.find({
        business: this.business,
        account: this.account,
        date: {
          $lte: upperBound,
        },
      }).sort({ date: 1, createdAt: 1 });
      const account = await Account.findById(range[0].account);
      if (range[0].type === constants.OPERATION_INCOME) {
        range[0].accountBalance = +account.initialBalance + range[0].amount;
      }
      if (range[0].type === constants.OPERATION_OUTCOME) {
        range[0].accountBalance = +account.initialBalance - range[0].amount;
      }
      await range[0].save();
      await this.updateBalanceInRange(range);
    } else {
      const range = await Transaction.find({
        business: this.business,
        account: this.account,
        date: { $gte: startTransaction[0].date },
      }).sort({ date: 1, createdAt: 1 });
      await this.updateBalanceInRange(range);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = error.message;
    }
    throw error;
  }
};

transactionSchema.methods.getRangeInAscLowerBound = async function (
  lowerBound
) {
  try {
    const range = await Transaction.find({
      business: this.business,
      account: this.account,
      date: {
        $gte: lowerBound,
      },
    }).sort({ date: 1, createdAt: 1 });
    return range;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = error.message;
    }
    throw error;
  }
};

transactionSchema.methods.updateBalanceInRange = async function (range) {
  try {
    if (range.length > 0) {
      let startBalance = range[0].accountBalance;
      range = range.slice(1);
      const promises = range.map(async (operation) => {
        if (operation.type == constants.OPERATION_INCOME) {
          operation.accountBalance = +startBalance + +operation.amount;
          startBalance = operation.accountBalance;
          return operation.save();
        } else {
          operation.accountBalance = +startBalance - operation.amount;
          startBalance = operation.accountBalance;
          return operation.save();
        }
      });
      await Promise.all(promises);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = error.message;
    }
    throw error;
  }
};

transactionSchema.methods.updateDate = async function (date) {
  const Transaction = mongoose.model("Transaction", transactionSchema);
  const Account = mongoose.model("Account");
  let lowerBound, upperBound;

  if (moment(date) > moment()) {
    if (!this.isPlanned) {
      const account = await Account.findById(this.account);
      if (this.type === constants.OPERATION_INCOME) {
        account.balance = +account.balance - this.amount;
      }
      if (this.type === constants.OPERATION_OUTCOME) {
        account.balance = +account.balance + +this.amount;
      }
      await account.save();
    }
  }

  if (moment(date) < moment()) {
    if (this.isPlanned) {
      const account = await Account.findById(this.account);
      if (this.type === constants.OPERATION_INCOME) {
        account.balance = +account.balance + +this.amount;
      }
      if (this.type === constants.OPERATION_OUTCOME) {
        account.balance = +account.balance - this.amount;
      }
      await account.save();
    }
    this.isPlanned = false;
  }

  if (moment(this.date) < moment(date)) {
    lowerBound = this.date;
    upperBound = date;
  } else {
    lowerBound = date;
    upperBound = this.date;
  }
  console.log("lowerBound: ", lowerBound);
  console.log("upperBound: ", upperBound);
  if (this.isPeriodic) {
    upperBound = this.repetitionEndDate;
  }
  this.date = date;
  await this.save();
  await this.getRangeInAsc(lowerBound, upperBound);
};

transactionSchema.methods.updateIsObligation = async function (
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
        this.obligationId = null;
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
  await this.addPeriodicChain(this.account);
  const range = await this.getRangeInAscLowerBound(this.date);
  await this.updateBalanceInRange(range);
};

transactionSchema.methods.updateIsPeriodic = async function (isPeriodic) {
  const Transaction = mongoose.model("Transaction");
  if (isPeriodic && !this.isPeriodic) {
    this.isPeriodic = true;
    this.rootOfPeriodicChain = true;
    this.periodicChainId = this._id;
    await this.save();
    await this.addPeriodicChain(this.account);
    const range = await this.getRangeInAscLowerBound(this.date);
    await this.updateBalanceInRange(range);
  }
  if (!isPeriodic && this.isPeriodic) {
    this.isPeriodic = false;
    await Transaction.deleteMany({
      periodicChainId: this._id,
      isPlanned: true,
    });
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
      account: account._id,
    };
    const transactions = await Transaction.find({
      $or: [
        {
          ...filter,
          date: { $eq: this.date },
          createdAt: { $gt: this.createdAt },
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
        return transaction.save();
      });
    } else {
      promises = transactions.map(async (transaction) => {
        transaction.accountBalance = +transaction.accountBalance - diff;
        return transaction.save();
      });
    }
    return Promise.all(promises);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

transactionSchema.methods.delete = async function () {
  const Account = mongoose.model("Account");
  const account = await Account.findById(this.account);

  // if (this.isPeriodic && this.isPlanned) {
  //   await Transaction.deleteMany({
  //     periodicChainId: this.periodicChainId,
  //     isPlanned: true,
  //   });
  //   return;
  // }

  if (this.isObligation && !this.isPlanned) {
    const contractor = await Contractor.findById(this.contractor);
    if (contractor) {
      //signs was reverted
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

  if (!this.isPlanned) {
    if (this.type === constants.OPERATION_INCOME) {
      account.balance = +account.balance - this.amount;
    }
    if (this.type === constants.OPERATION_OUTCOME) {
      account.balance = +account.balance + +this.amount;
    }
    await account.save();
  }
  const diff = 0 - this.amount;
  await Transaction.findByIdAndRemove(this._id);
  await this.updateTransactionsBalance(diff, account);
};

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
