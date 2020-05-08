const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
  },
  isOwnerTransfer: Boolean,
  kind: {
    type: Number,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Category", categorySchema);
