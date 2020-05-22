const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contractorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    contactPerson: String,
    phoneNumber: String,
    email: String,
    description: String,
    balance: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contractor", contractorSchema);
