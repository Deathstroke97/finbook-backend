const moment = require("moment");
const mongoose = require("mongoose");
const axios = require("axios");

const constants = require("../constants");

exports.populateTransactions = (aggResult) => {
  //need to change to mongoose.model("Account")
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
      path: "incomeOperations.account",
      select: "currency",
    }),
    Account.populate(aggResult, {
      path: "outcomeOperations.account",
      select: "name",
    }),
    Account.populate(aggResult, {
      path: "outcomeOperations.account",
      select: "currency",
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

exports.transformToString = (array, collectionType) => {
  if (collectionType === constants.COLLECTION_TYPE_TRANSACTION) {
    array = array.map((el) => {
      return {
        ...el._doc,
        amount: parseFloat(el.amount).toFixed(2),
        accountBalance: parseFloat(el.accountBalance).toFixed(2),
      };
    });
  }
  if (collectionType === constants.COLLECTION_TYPE_PROJECT) {
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
  if (collectionType === constants.COLLECTION_TYPE_CONTRACTOR) {
    array = array.map((el) => {
      return {
        ...el._doc,
        balance: parseFloat(el.balance).toFixed(2),
      };
    });
  }
  if (collectionType === constants.COLLECTION_TYPE_OBLIGATION) {
    array = array.map((el) => {
      return {
        ...el._doc,
        amount: parseFloat(el.amount).toFixed(2),
      };
    });
  }
  return array;
};

// exports.convertToBusinessCurrency = async (account, business) => {
//   const accountCurrency = account.currency;
//   const businessCurrency = business.currency;
//   if (businessCurrency === accountCurrency) {
//     return +account.balance;
//   } else {
//     let exchangeRate = 1;
//     // console.log("global.conversion_rates: ", global.conversion_rates);
//     if (!global.conversion_rates) {
//       console.log("global.conversion_rates are undefined");
//       try {
//         const resourse1 = await axios.get(
//           `https://free.currconv.com/api/v7/convert?q=${accountCurrency}_${businessCurrency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
//         );
//         exchangeRate = resourse1.data[`${accountCurrency}_${businessCurrency}`];
//         global.conversion_rates = {};
//         global.conversion_rates[businessCurrency] = exchangeRate;
//       } catch (err) {
//         try {
//           const resourse2 = await axios.get(
//             `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${accountCurrency}`
//           );
//           exchangeRate = resourse2.data.conversion_rates[businessCurrency];
//           global.conversion_rates = resourse2.data.conversion_rates;
//         } catch (err) {
//           throw new Error(err);
//         }
//       }
//     } else {
//       exchangeRate = global.conversion_rates[businessCurrency];
//     }
//     // console.log("global.conversion_rates: ", global.conversion_rates);
//     return exchangeRate * parseFloat(account.balance);
//   }
// };

exports.getConversionRates = async (accounts, businessCurrency) => {
  let conversion_rates = {};
  for (const account of accounts) {
    const accountCurrency = account.currency;

    try {
      // const resourse1 = await axios.get(
      //   `https://free.currconv.com/api/v7/convert?q=${accountCurrency}_${businessCurrency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
      // );
      // exchangeRate = resourse1.data[`${accountCurrency}_${businessCurrency}`];
      conversion_rates[accountCurrency] = 1;
      conversion_rates[account._id] = 1;
    } catch (err) {
      try {
        const resourse2 = await axios.get(
          `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${accountCurrency}`
        );
        exchangeRate = resourse2.data.conversion_rates[accountCurrency];
        conversion_rates[accountCurrency] = exchangeRate;
        conversion_rates[account._id] = exchangeRate;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
  return conversion_rates;
};

exports.convertToBusinessCurrency = async (account, business) => {
  const accountCurrency = account.currency;
  const businessCurrency = business.currency;
  if (businessCurrency === accountCurrency) {
    return +account.balance;
  } else {
    let exchangeRate = 1;

    try {
      // const resourse1 = await axios.get(
      //   `https://free.currconv.com/api/v7/convert?q=${accountCurrency}_${businessCurrency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
      // );
      // exchangeRate = resourse1.data[`${accountCurrency}_${businessCurrency}`];
      exchangeRate = 1;
    } catch (err) {
      try {
        const resourse2 = await axios.get(
          `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${accountCurrency}`
        );
        exchangeRate = resourse2.data.conversion_rates[businessCurrency];
      } catch (err) {
        throw new Error(err);
      }
    }
    return exchangeRate * parseFloat(account.balance);
  }
};

exports.convertToBusinessCurrencyWithAmount = async (
  account,
  business,
  amount
) => {
  const accountCurrency = account.currency;
  const businessCurrency = business.currency;
  if (businessCurrency === accountCurrency) {
    return +account.balance;
  } else {
    let exchangeRate = 1;
    if (!global.conversion_rates) {
      try {
        // const resourse1 = await axios.get(
        //   `https://free.currconv.com/api/v7/convert?q=${accountCurrency}_${businessCurrency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
        // );
        // exchangeRate = resourse1.data[`${accountCurrency}_${businessCurrency}`];
        // global.conversion_rates = {};
        // global.conversion_rates[businessCurrency] = exchangeRate;
        exchangeRate = 1;
      } catch (err) {
        try {
          const resourse2 = await axios.get(
            `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${accountCurrency}`
          );
          exchangeRate = resourse2.data.conversion_rates[businessCurrency];
          global.conversion_rates = resourse2.data.conversion_rates;
        } catch (err) {
          throw new Error(err);
        }
      }
    } else {
      exchangeRate = global.conversion_rates[businessCurrency];
    }

    return exchangeRate * parseFloat(amount);
  }
};

exports.getExchageRate = async (account, business) => {
  const accountCurrency = account.currency;
  const businessCurrency = business.currency;
  if (businessCurrency === accountCurrency) {
    return 1;
  } else {
    let exchangeRate = 1;

    try {
      // const resourse1 = await axios.get(
      //   `https://free.currconv.com/api/v7/convert?q=${accountCurrency}_${businessCurrency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
      // );
      // exchangeRate = resourse1.data[`${accountCurrency}_${businessCurrency}`];
      exchangeRate = 1;
    } catch (err) {
      try {
        const resourse2 = await axios.get(
          `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${accountCurrency}`
        );
        exchangeRate = resourse2.data.conversion_rates[businessCurrency];
      } catch (err) {
        throw new Error(err);
      }
    }

    return exchangeRate;
  }
};
