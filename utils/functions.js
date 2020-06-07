const moment = require("moment");
const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");

exports.populateWithBuckets = (queryData) => {
  let details = [];
  let startDate = moment(queryData.createTime.$gte);
  let endDate = moment(queryData.createTime.$lte);

  let month = moment(startDate);

  while (month <= endDate) {
    details.push({
      month: month.month(),
      year: month.year(),
      totalAmount: 0,
      operations: [],
    });
    month.add(1, "month");
  }
  return {
    total: 0,
    details,
  };
};

exports.calculateBalance = (report) => {
  const { incomes, outcomes, balance } = report;
  for (let i = 0; i < balance.details.length; i++) {
    balance.details[i].totalAmount =
      incomes.details[i].totalAmount - outcomes.details[i].totalAmount;
  }
  balance.total = incomes.total - outcomes.total;
};
