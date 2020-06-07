const { populateWithBuckets } = require("./functions");

exports.getSkeletonForContractorReport = (queryData) => {
  const report = {
    moneyInTheBeginning: populateWithBuckets(queryData),
    incomes: {
      ...populateWithBuckets(queryData),

      contractors: [],
    },
    outcomes: {
      ...populateWithBuckets(queryData),
      contractors: [],
    },
    balance: {
      ...populateWithBuckets(queryData),
    },
    moneyInTheEnd: populateWithBuckets(queryData),
  };
  return report;
};
