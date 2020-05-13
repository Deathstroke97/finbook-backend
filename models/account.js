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
  amount: Schema.Types.Decimal128,
  initialAmount: Schema.Types.Decimal128,
  initialAmountDate: Date,
});

module.exports = mongoose.model("Account", accountSchema);
