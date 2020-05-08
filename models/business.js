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
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    contractors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contractor",
      },
    ],
    bankAccounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "BankAccount",
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    totalIncome: Schema.Types.Decimal128,
    totalOutcome: Schema.Types.Decimal128,
    totalBalance: Schema.Types.Decimal128,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
