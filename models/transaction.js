const mongoose = require("mongoose");
const moment = require("moment");

const Obligation = require("../models/obligation");
const Account = require("../models/account");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
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
  },
  relatedDate: {
    type: Date,
    required: true,
  },
  isPlanned: Boolean,
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
});

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
  await this.save();
};

transactionSchema.methods.addPeriodicChain = async function () {
  let beginDate = moment(this.date).valueOf();
  let endDate = moment(this.repetitionEndDate).valueOf();
  let period = "";
  const promises = [];
  switch (this.period) {
    case "week":
      period = moment.duration(7, "days").valueOf();
      break;
    case "month":
      period = moment.duration(1, "month").valueOf();
      break;
    case "twoMonth":
      period = moment.duration(2, "months").valueOf();
      break;
    case "quarter":
      period = moment.duration(1, "quarter").valueOf();
      break;
    case "halfYear":
      period = moment.duration(6, "months").valueOf();
      break;
    case "year":
      period = moment.duration(1, "year").valueOf();
      break;
  }
  beginDate += period;

  while (beginDate <= endDate) {
    const Transaction = mongoose.model("Transaction", transactionSchema);

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
    });
    if (this.isObligation && new Date(beginDate) <= new Date()) {
      promises.push(transaction.attachObligation);
    }
    promises.push(transaction.save());
    beginDate += period;
  }
  const transactions = await Promise.all(promises);
  return transactions;
};

module.exports = mongoose.model("Transaction", transactionSchema);
