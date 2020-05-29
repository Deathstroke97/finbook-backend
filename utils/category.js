const moment = require("moment");
const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");
const Transaction = require("../models/transaction");
const Account = require("../models/account");

exports.populateWithBuckets = (array, queryData) => {
  let startDate = moment(queryData.createTime.$gte);
  let endDate = moment(queryData.createTime.$lte);

  let month = moment(startDate);

  while (month <= endDate) {
    array.push({
      month: month.month(),
      year: month.year(),
      totalAmount: 0,
      operations: [],
    });
    month.add(1, "month");
  }
  return array;
};

exports.getMoneyInTheBeginning = async (businessId, countPlanned, array) => {
  const filterPlanned = countPlanned ? {} : { isPlanned: false };
  const accounts = await Account.find({ business: businessId });
  for (let i = 0; i < array.length; i++) {
    let month = array[i].month;
    let year = array[i].year;
    let date = moment([year, month, 1]);

    let totalAmount = 0;

    for (let i = 0; i < accounts.length; i++) {
      const transaction = await Transaction.find({
        business: businessId,
        ...filterPlanned,
        account: accounts[i]._id,
        date: { $lt: date },
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(1);

      if (transaction.length > 0) {
        accountBalance = parseFloat(transaction[0].accountBalance);
        totalAmount += accountBalance;
      } else {
        if (date >= moment(accounts[i].initialBalanceDate)) {
          totalAmount += +accounts[i].initialBalance;
        }
      }
    }
    array[i].totalAmount = totalAmount;
  }
};

exports.getMoneyInTheEnd = async (businessId, countPlanned, array) => {
  const filterPlanned = countPlanned ? {} : { isPlanned: false };
  const accounts = await Account.find({ business: businessId });
  for (let i = 0; i < array.length; i++) {
    let month = array[i].month;
    let year = array[i].year;
    let date = moment([year, month, 1]).endOf("month");

    let totalAmount = 0;

    for (let i = 0; i < accounts.length; i++) {
      const transaction = await Transaction.find({
        business: businessId,
        ...filterPlanned,
        account: accounts[i]._id,
        date: { $lte: date },
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(1);

      if (transaction.length > 0) {
        accountBalance = parseFloat(transaction[0].accountBalance);
        totalAmount += accountBalance;
      } else {
        if (date >= moment(accounts[i].initialBalanceDate)) {
          totalAmount += +accounts[i].initialBalance;
        }
      }
    }
    array[i].totalAmount = totalAmount;
  }
};

exports.getBalance = async ({ incomes, outcomes }, array) => {
  for (let i = 0; i < array.length; i++) {
    array[i].balance = incomes[i].totalAmount - outcomes[i].totalAmount;
  }
};
