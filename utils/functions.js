const moment = require("moment");
const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");

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
