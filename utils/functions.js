const moment = require("moment");
const mongoose = require("mongoose");
const Project = require("../models/project");
const Transaction = require("../models/transaction");
const ObjectId = mongoose.Types.ObjectId;
const Business = require("../models/business");
const axios = require("axios");

const { aggregate } = require("../models/contractor");
const e = require("express");

exports.populateTransactions = (aggResult) => {
  const Account = require("../models/account");
  const Category = require("../models/category");
  const Contractor = require("../models/contractor");
  const Project = require("../models/project");
  const promises = [
    Account.populate(aggResult, {
      path: "incomeOperations.account",
      select: "name",
    }),
    Account.populate(aggResult, {
      path: "outcomeOperations.account",
      select: "name",
    }),

    Category.populate(aggResult, {
      path: "incomeOperations.category",
      select: "name",
    }),

    Category.populate(aggResult, {
      path: "outcomeOperations.category",
      select: "name",
    }),

    Contractor.populate(aggResult, {
      path: "incomeOperations.contractor",
      select: "name",
    }),

    Contractor.populate(aggResult, {
      path: "outcomeOperations.contractor",
      select: "name",
    }),

    Project.populate(aggResult, {
      path: "incomeOperations.project",
      select: "name",
    }),
    Project.populate(aggResult, {
      path: "outcomeOperations.project",
      select: "name",
    }),
  ];
  return Promise.all(promises);
};

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

exports.transformToString = (array, dataType) => {
  if (dataType === "transaction") {
    array = array.map((el) => {
      return {
        ...el._doc,
        amount: parseFloat(el.amount).toFixed(2),
        accountBalance: parseFloat(el.accountBalance).toFixed(2),
      };
    });
  }
  if (dataType === "project") {
    array = array.map((el) => {
      return {
        ...el._doc,
        planIncome: parseFloat(el.planIncome).toFixed(2),
        planOutcome: parseFloat(el.planOutcome).toFixed(2),
        factIncome: parseFloat(el.factIncome).toFixed(2),
        factOutcome: parseFloat(el.factOutcome).toFixed(2),
      };
    });
  }
  return array;
};
