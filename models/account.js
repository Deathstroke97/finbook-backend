const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  currency: {
    type: String,
    enum: ["RUR", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],
    required: true,
  },
  number: {
    type: String,
  },
  bankName: String,
  balance: Schema.Types.Decimal128,
  initialBalance: Schema.Types.Decimal128,
  initialBalanceDate: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.methods.updateBalance = function (transactions) {
  let total = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (!transactions[i].isPlanned) {
      total += +transactions[i].amount;
    }
  }
  this.balance += total;
  return this.save();
};

module.exports = mongoose.model("Account", accountSchema);
