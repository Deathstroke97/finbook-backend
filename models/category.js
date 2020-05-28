const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;
const Account = require("../models/account");
const Project = require("../models/project");
const Contractor = require("../models/contractor");
const { OPERATION_INCOME, OPERATION_OUTCOME } = require("../constants");
const ObjectId = mongoose.Types.ObjectId;
const {
  populateOverallReport,
  populateWithBuckets,
} = require("../utils/functions");

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

categorySchema.statics.generateReportByCategory = async function ({
  businessId,
  queryData,
}) {
  const Category = mongoose.model("Category", categorySchema);

  const aggResult = await Category.aggregate([
    {
      $match: {
        business: ObjectId(businessId),
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "category",
        as: "transactions",
      },
    },
    {
      $unwind: "$transactions",
    },
    {
      $match: {
        "transactions.date": {
          $gte: new Date(moment().startOf("year").valueOf()),
          $lte: new Date(moment().endOf("year").valueOf()),
        },
      },
    },
    {
      $project: {
        "transactions.isPlanned": 0,
        "transactions.isPeriodic": 0,
        "transactions.rootOfPeriodicChain": 0,
        "transactions.isObligation": 0,

        "transactions.business:": 0,
        "transactions.contractor": 0,
        "transactions.project": 0,
        "transactions.account:": 0,
        "transactions.createdAt": 0,
        "transactions.updatedAt:": 0,
        "transactions.accountBalance": 0,
      },
    },
    {
      $sort: { "transactions.date": 1 },
    },
    {
      $group: {
        _id: { category: "$name", kind: "$kind", type: "$type" },
        total: { $sum: "$transactions.amount" },
        operations: { $push: "$transactions" },
      },
    },
  ]);

  // const test = {
  //   createdTime: {
  //     $gte: moment("2020-05-01"),
  //     $lte: moment("2020-09-01"),
  //   },
  // };
  // console.log("gte: ", moment(test.createdTime.$gte).month());
  // console.log("lte: ", moment(test.createdTime.$lte).month());

  // await Account.populate(aggResult, {
  //   path: "operations.account",
  //   select: "name",
  // });
  // await Contractor.populate(aggResult, {
  //   path: "operations.contractor",
  //   select: "name",
  // });
  // await Project.populate(aggResult, {
  //   path: "operations.project",
  //   select: "name",
  // });

  let report = {
    moneyInTheBeginning: [{}],
    // overallReport: { incomes: [], outcomes: [] },
    detailReport: [],
    incomes: [],
    outcomes: [],
  };

  populateWithBuckets(report.incomes, queryData);
  populateWithBuckets(report.outcomes, queryData);

  aggResult.forEach((category) => {
    let categoryInfo = {
      name: category._id.category,
      kind: category._id.kind,
      type: category._id.type,
      months: populateWithBuckets([], queryData),
    };

    let month = moment(category.operations[0].date).month();
    let year = moment(category.operations[0].date).year();

    categoryInfo.months.push({
      month: month,
      year: year,
      totalAmount: +category.operations[0].amount,
      operations: [category.operations[0]],
    });

    category.operations.forEach((operation, index) => {
      if (index === 0) return;

      let opMonth = moment(operation.date).month();
      let opYear = moment(operation.date).year();

      if (opMonth === month && opYear == year) {
        categoryInfo.months[
          categoryInfo.months.length - 1
        ].totalAmount += +operation.amount;
        categoryInfo.months[categoryInfo.months.length - 1].operations.push(
          operation
        );
      } else {
        month = moment(operation.date).month();
        year = moment(operation.date).year();
        categoryInfo.months.push({
          month: month,
          year: year,
          totalAmount: +operation.amount,
          operations: [operation],
        });
      }
    });
    report.detailReport.push(categoryInfo);
  });
  populateOverallReport(report);
  return report;
};

module.exports = mongoose.model("Category", categorySchema);
