const Transaction = require("../models/transaction");
const Category = require("../models/category");
const Account = require("../models/account");
const {
  CATEGORY,
  ACTIVITY,
  ACCOUNT,
  CONTRACTOR,
  PROJECT,
} = require("../constants");

exports.getCashFlow = async (req, res, next) => {
  const { businessId, queryData, reportBy } = req.body;
  let result = null;
  try {
    switch (reportBy) {
      case CATEGORY:
        result = await Category.generateReportByCategory(req.body);
        break;
      case ACTIVITY:
        result = await Category.generateReportByActivity(req.body);
        break;
      case ACCOUNT:
        result = await Account.generateReportByAccounts(req.body);
        break;
      case CONTRACTOR:
        result = await Category.generateReportByContractor(req.body);
        break;
      case PROJECT:
        result = await Category.generateReportByProject(req.body);
        break;
    }

    res.status(200).json({
      result: result,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
