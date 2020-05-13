const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transferSchema = new Schema({
  exchangeRate: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  amount: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  fromBankAccount: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  toBankAccount: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  date: Date,
  description: String,
});

module.exports = mongoose.model("Transfer", transferSchema);
