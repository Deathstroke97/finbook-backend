const Project = require("../models/project");
const Account = require("../models/account");
const Business = require("../models/business");
const Transaction = require("../models/transaction");
const { getOverallNumbers, transformToString } = require("../utils/functions");
const constants = require("../constants");
const { getConversionRates } = require("../utils/functions");

exports.getProjects = async (req, res, next) => {
  const businessId = req.businessId;
  const { type, name, page, rowsPerPage } = req.body;
  let query = {};
  query.business = businessId;
  if (type === constants.UNCOMPLETED) query.isFinished = false;
  if (name) query.name = new RegExp("^" + name, "i");
  // if (name) query.name = { $regex: name, $options: "i" };

  try {
    const projects = await Project.find(query)
      .skip(page * rowsPerPage)
      .limit(rowsPerPage);

    const business = await Business.findById(businessId);
    const accounts = await Account.find({ business: businessId });
    const conversionRates = await getConversionRates(
      accounts,
      business.currency
    );

    for (const project of projects) {
      await project.getFactSumTransactions(conversionRates);
    }
    const totalItems = await Project.find(query).countDocuments();
    res.status(200).json({
      message: "Projects fetched.",
      projects: transformToString(projects, constants.COLLECTION_TYPE_PROJECT),
      totalItems: totalItems,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  const businessId = req.businessId;
  const { name, description, planIncome, planOutcome } = req.body;
  const project = new Project({
    name,
    description,
    planIncome,
    planOutcome,
    business: businessId,
  });
  try {
    await project.save();
    res.status(201).json({
      message: "Project created.",
      project: project,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  const projectId = req.params.projectId;
  const { name, description, planIncome, planOutcome, isFinished } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Could not find requested project.");
      error.statusCode = 404;
      throw error;
    }
    project.name = name;
    project.description = description;
    project.planIncome = planIncome;
    project.planOutcome = planOutcome;
    project.isFinished = isFinished;
    await project.save();
    res.status(200).json({
      message: "Project updated.",
      project: project,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  const projectId = req.params.projectId;
  try {
    const project = await Project.findById(projectId);
    const transactions = await Transaction.find({ project: projectId });
    for (const transaction of transactions) {
      transaction.project = null;
      await transaction.save();
    }
    if (!project) {
      const error = new Error("Could not find requested project.");
      error.statusCode = 404;
      throw error;
    }
    await Project.findByIdAndRemove(projectId);
    res.status(200).json({
      message: "Project deleted. ",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getProject = async (req, res, next) => {
  const businessId = req.businessId;
  const projectId = req.params.projectId;
  const { startTime, endTime, page, rowsPerPage } = req.query;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Could not find requested project.");
      error.statusCode = 404;
      throw error;
    }
    const overallNumbers = await Account.getOverallNumbers(
      businessId,
      null,
      project,
      startTime,
      endTime
    );
    let transactionDates = {};
    if (startTime && endTime) {
      transactionDates = {
        date: {
          $gte: startTime,
          $lte: endTime,
        },
      };
    }

    const transactions = await Transaction.find({
      project: projectId,
      ...transactionDates,
    })
      .populate("account")
      .populate("category")
      .populate("contractor")
      .populate("project")
      .sort({ date: -1, createdAt: -1 })
      .skip(+page * +rowsPerPage)
      .limit(+rowsPerPage);

    const totalItems = await Transaction.find({
      project: projectId,
      ...transactionDates,
    }).countDocuments();

    const queryData = {
      createTime: {
        $gte: startTime,
        $lte: endTime,
      },
    };
    const report = await Project.generateCashFlowByProject(
      businessId,
      queryData,
      false
    );

    res.status(200).json({
      transactions: transformToString(
        transactions,
        constants.COLLECTION_TYPE_TRANSACTION
      ),
      overallNumbers,
      totalItems,
      project: transformToString(
        [project],
        constants.COLLECTION_TYPE_PROJECT
      )[0],
      report: report,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
