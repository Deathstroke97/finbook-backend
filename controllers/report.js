const Transaction = require('../models/transaction')

exports.getCashFlow = async (req, res, next) => {
  const {
    businessId,
    queryData,
  }
  const transactions = await Transaction.find()
}