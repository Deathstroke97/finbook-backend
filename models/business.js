const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalIncome: Schema.Types.Decimal128,
    totalOutcome: Schema.Types.Decimal128,
    totalBalance: Schema.Types.Decimal128,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
