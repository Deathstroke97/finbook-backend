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
    currency: {
      type: String,
      enum: ["RUB", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],
      required: true,
      default: "KZT",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
