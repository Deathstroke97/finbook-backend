const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "business",
    },
    businessName: {
      type: String,
    },
    name: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
