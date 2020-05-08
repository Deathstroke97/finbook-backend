const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
    description: String,
    planIncome: Schema.Types.Decimal128,
    planOutcome: Schema.Types.Decimal128,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
