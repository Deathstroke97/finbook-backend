const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const obligationSchema = new Schema(
  {
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    contractor: {
      type: Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
    currency: {
      type: String,
      enum: ["RUR", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],
      required: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Obligation", obligationSchema);
