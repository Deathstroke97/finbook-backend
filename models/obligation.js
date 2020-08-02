const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const Business = require("./business");
const axios = require("axios");

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
    },
    contractor: {
      type: Schema.Types.ObjectId,
      ref: "Contractor",
      // required: true,
    },
    currency: {
      type: String,
      enum: ["RUB", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],
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

obligationSchema.statics.getBalance = async function (
  businessId,
  contractorId
) {
  const business = await Business.findById(businessId);
  const aggResult = await Obligation.aggregate([
    {
      $match: {
        contractor: ObjectId(contractorId),
        transaction: null,
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          currency: "$currency",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  let totalIn = 0;
  let totalOut = 0;
  for (const result of aggResult) {
    let exchangeRate = 1;
    if (result._id.currency !== business.currency) {
      const response = await axios.get(
        `https://free.currconv.com/api/v7/convert?q=${result._id.currency}_${business.currency}&compact=ultra&apiKey=763858c5637f159b8186`
      );
      exchangeRate =
        response.data[`${result._id.currency}_${business.currency}`];
    }
    if (result._id.type === "in") {
      totalIn += exchangeRate * +result.total;
    }
    if (result._id.type === "out") {
      totalOut += exchangeRate * +result.total;
    }
  }
  let balance = (totalIn - totalOut) * -1;
  return balance;
};

const Obligation = mongoose.model("Obligation", obligationSchema);

module.exports = Obligation;
