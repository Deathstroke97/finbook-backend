const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;

const constants = require("../constants");

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

exports.constructReportByContractor = (aggResult, report, queryData) => {
  aggResult.forEach((contractor) => {
    report.incomes.contractors.push({
      name: contractor._id.contractor,
      periods: populateWithBuckets(queryData),
    });

    contractor.incomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.incomes.contractors.length - 1;

      report.incomes.contractors[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.incomes.total += +operation.amount;
            report.incomes.details[index].totalAmount += +operation.amount;
            report.incomes.contractors[
              lastIndex
            ].periods.total += +operation.amount;
          }
        }
      );
    });

    report.outcomes.contractors.push({
      name: contractor._id.contractor,
      periods: populateWithBuckets(queryData),
    });
    contractor.outcomeOperations.forEach((operation) => {
      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      const lastIndex = report.outcomes.contractors.length - 1;

      report.outcomes.contractors[lastIndex].periods.details.forEach(
        (period, index) => {
          if (period.month == opMonth && period.year == opYear) {
            period.totalAmount += +operation.amount;
            report.outcomes.total += +operation.amount;
            report.outcomes.details[index].totalAmount += +operation.amount;
            report.outcomes.contractors[
              lastIndex
            ].periods.total += +operation.amount;
          }
        }
      );
    });
  });
};

exports.getEmptyContractorTransactions = async (
  businessId,
  countPlanned,
  queryData
) => {
  const Transaction = require("../models/transaction");
  const contractor = {
    _id: {
      contractor: null,
    },
  };
  const filterPlanned = countPlanned ? {} : { isPlanned: false };

  const incomeOperations = await Transaction.find({
    business: ObjectId(businessId),
    ...filterPlanned,
    date: queryData.createTime,
    contractor: null,
    type: constants.OPERATION_INCOME,
  });

  const outcomeOperations = await Transaction.find({
    business: ObjectId(businessId),
    ...filterPlanned,
    date: queryData.createTime,
    contractor: null,
    type: constants.OPERATION_OUTCOME,
  });
  contractor.incomeOperations = incomeOperations;
  contractor.outcomeOperations = outcomeOperations;
  return contractor;
};
