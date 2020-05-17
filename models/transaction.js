const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const Obligation = require("../models/obligation");
const Account = require("../models/account");
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
      required: true,
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
  const account = await Account.findById(this.account);
  const obligation = new Obligation({
    business: this.business,
    date: this.date,
    amount: this.amount,
    type: this.type == "income" ? "in" : "out",
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

transactionSchema.statics.updateTransactionsBalance = async function (
  transaction
) {
  try {
    const Transaction = mongoose.model("Transaction", transactionSchema);
    const transactions = await Transaction.find({
      date: {
        $gt: transaction.date,
      },
    });

    if (transactions.length > 0) {
      const promises = transactions.map(async (operation) => {
        if (transaction.type === OPERATION_INCOME) {
          operation.accountBalance =
            +operation.accountBalance + +transaction.amount;
        } else {
          operation.accountBalance =
            +operation.accountBalance - transaction.amount;
        }
        console.log("operation.accountBalance: ", +operation.accountBalance);
        return operation.save();
      });
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

module.exports = mongoose.model("Transaction", transactionSchema);
