const moment = require("moment");
const mongoose = require("mongoose");

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

exports.getSkeleton = (queryData) => {
  const report = {
    incomes: {
      ...exports.populateWithBuckets(queryData),
      categories: [],
    },
    outcomes: {
      ...exports.populateWithBuckets(queryData),
      categories: [],
    },
    balance: {
      ...exports.populateWithBuckets(queryData),
    },
  };
  return report;
};

exports.filterEmptyCategoriesCashFlow = (report) => {
  report.incomes.categories = report.incomes.categories.filter(
    (category) => category.periods.total !== 0
  );
  report.outcomes.categories = report.outcomes.categories.filter(
    (category) => category.periods.total !== 0
  );
};

exports.filterEmptyCategoriesProfitAndLoss = (report) => {
  report.incomes.withProjects.categories = report.incomes.withProjects.categories.filter(
    (category) => category.periods.total !== 0
  );
  report.incomes.withoutProjects.categories = report.incomes.withoutProjects.categories.filter(
    (category) => category.periods.total !== 0
  );
  report.outcomes.withProjects.categories = report.outcomes.withProjects.categories.filter(
    (category) => category.periods.total !== 0
  );
  report.outcomes.withoutProjects.categories = report.outcomes.withoutProjects.categories.filter(
    (category) => category.periods.total !== 0
  );
};
