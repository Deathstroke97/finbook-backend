const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");

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
  balance: {
    type: Schema.Types.Decimal128,
    default: 0,
  },
  initialBalance: {
    type: Schema.Types.Decimal128,
    default: 0,
  },
  initialBalanceDate: {
    type: Date,
    default: Date.now,
  },
});

// accountSchema.methods.updateBalance = function (transactions) {
//   let total = 0;
//   console.log("transactions: ", transactions);
//   for (let i = 0; i < transactions.length; i++) {
//     if (
//       !transactions[i].hasOwnProperty("isPlanned") &&
//       !transactions[i].isPlanned
//     ) {
//       console.log("amount: ", transactions[i].amount);
//       total += +transactions[i].amount;
//     }
//   }
//   this.balance += total;
//   return this.save();
// };

// accountSchema.methods.updateBalance = async function(transaction) {
//   if (transaction.type === OPERATION_INCOME) {

//   }
// }

module.exports = mongoose.model("Account", accountSchema);
