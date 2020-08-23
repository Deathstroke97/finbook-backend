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
  const businessId = req.businessId;
  const { queryData, reportBy, countPlanned } = req.body;

  let result = null;
  try {
    switch (reportBy) {
      case CATEGORY:
        result = await Category.generateCashFlowByCategory(
          businessId,
          queryData,
          countPlanned
        );
        break;
      case ACTIVITY:
        result = await Category.generateCashFlowByActivity(
          businessId,
          queryData,
          countPlanned
        );
        break;
      case ACCOUNT:
        result = await Account.generateCashFlowByAccounts(
          businessId,
          queryData,
          countPlanned
        );
        break;
      case CONTRACTOR:
        result = await Contractor.generateCashFlowByContractor(
          businessId,
          queryData,
          countPlanned
        );
        break;
      case PROJECT:
        result = await Project.generateCashFlowByProject(
          businessId,
          queryData,
          countPlanned
        );
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
  const businessId = req.businessId;
  const { reportBy, queryData, countPlanned, method } = req.body;
  let result = null;

  try {
    switch (reportBy) {
      case CATEGORY:
        result = await Category.generateProfitAndLossByCategory(
          businessId,
          queryData,
          countPlanned,
          method
        );
        break;
      case PROJECT:
        result = await Project.generateProfitAndLossByProject(
          businessId,
          queryData,
          countPlanned,
          method
        );
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
