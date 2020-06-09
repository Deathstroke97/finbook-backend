const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const Obligation = require("./obligation");

const Contractor = require("./contractor");

const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");
const {
  PERIOD_WEEK,
  PERIOD_MONTH,
  PERIOD_TWO_MONTH,
  PERIOD_QUARTER,
  PERIOD_HALF_YEAR,
  PERIOD_YEAR,
} = require("../constants");

const transactionSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
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
      enum: ["week", "month", "twoMonth", "quarter", "halfYear", "year"],
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
    if (this.type === OPERATION_INCOME) {
      contractor.balance = +contractor.balance + +this.amount;
    }
    if (this.type === OPERATION_OUTCOME) {
      contractor.balance = +contractor.balance - this.amount;
    }
    await contractor.save();
  }

  const obligation = new Obligation({
    business: this.business,
    date: this.date,
    amount: this.amount,
    type: this.type == OPERATION_INCOME ? "in" : "out",
    contractor: this.contractor,
    currency: account.currency,
    transaction: this._id,
  });
  await obligation.save();
  this.obligationId = obligation._id;
  return this.save();
};

transactionSchema.methods.addPeriodicChain = async function (account) {
  let beginDate = moment(this.date).valueOf();
  let endDate = moment(this.repetitionEndDate).valueOf();
  let period = "";
  let actualAccountBalance = +account.balance;
  switch (this.period) {
    case PERIOD_WEEK:
      period = moment.duration(7, "days").valueOf();
      break;
    case PERIOD_MONTH:
      period = moment.duration(1, "month").valueOf();
      break;
    case PERIOD_TWO_MONTH:
      period = moment.duration(2, "months").valueOf();
      break;
    case PERIOD_QUARTER:
      period = moment.duration(1, "quarter").valueOf();
      break;
    case PERIOD_HALF_YEAR:
      period = moment.duration(6, "months").valueOf();
      break;
    case PERIOD_YEAR:
      period = moment.duration(1, "year").valueOf();
      break;
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
        this.type === OPERATION_INCOME
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
        isPeriodic: new Date(beginDate) > new Date(),
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
          this.type == OPERATION_INCOME
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
      date: { $gt: this.date },
    });
    let promises = [];
    if (transactions.length > 0) {
      if (this.type === OPERATION_INCOME) {
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
      if (transaction[0].type == OPERATION_INCOME) {
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
      if (operation.type == OPERATION_INCOME) {
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

transactionSchema.methods.updateTransactionsBalance = async function (diff) {
  const Account = require("./account");
  try {
    const Transaction = mongoose.model("Transaction", transactionSchema);

    const account = await Account.findById(this.account);
    const filter = {
      business: this.business,
      account: this.account,
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
    if (this.type === OPERATION_INCOME) {
      promises = transactions.map(async (transaction) => {
        transaction.accountBalance = +transaction.accountBalance + diff;
        if (!transaction.isPlanned) {
          account.balance = transaction.accountBalance;
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

module.exports = mongoose.model("Transaction", transactionSchema);
