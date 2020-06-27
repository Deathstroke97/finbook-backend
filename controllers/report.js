const Transaction = require("../models/transaction");
const Category = require("../models/category");
const Account = require("../models/account");
const Contractor = require("../models/contractor");
const Project = require("../models/project");
const {
  CATEGORY,
  ACTIVITY,
  ACCOUNT,
  CONTRACTOR,
  PROJECT,
} = require("../constants");

exports.getCashFlowReport = async (req, res, next) => {
  const { businessId, queryData, reportBy } = req.body;
  let result = null;
  try {
    switch (reportBy) {
      case CATEGORY:
        result = await Category.generateCashFlowByCategory(req.body);
        break;
      case ACTIVITY:
        result = await Category.generateCashFlowByActivity(req.body);
        break;
      case ACCOUNT:
        result = await Account.generateCashFlowByAccounts(req.body);
        break;
      case CONTRACTOR:
        result = await Contractor.generateCashFlowByContractor(req.body);
        break;
      case PROJECT:
        result = await Project.generateCashFlowByProject(req.body);
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

exports.getProfitAndLossReport = async (req, res, next) => {
  const { businessId, queryData, reportBy, method } = req.body;
  let result = null;

  try {
    switch (reportBy) {
      case CATEGORY:
        result = await Category.generateProfitAndLossByCategory(req.body);
        break;
      case PROJECT:
        result = await Project.generateProfitAndLossByProject(req.body);
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
