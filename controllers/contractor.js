const Contractor = require("../models/contractor");
const Transaction = require("../models/transaction");
const Obligation = require("../models/obligation");

exports.getContractors = async (req, res, next) => {
  const businessId = req.businessId;
  try {
    const contractors = await Contractor.find({ business: businessId });
    res.status(200).json({
      message: "contractors fetched.",
      contractors: contractors,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createContractor = async (req, res, next) => {
  const businessId = req.body.businessId;
  const {
    name,
    description,
    contactPerson,
    phoneNumber,
    email,
    balance,
  } = req.body;
  const contractor = new Contractor({
    name,
    description,
    contactPerson,
    phoneNumber,
    email,
    balance,
    business: businessId,
  });
  try {
    await contractor.save();
    res.status(201).json({
      message: "contractor created.",
      contractor: contractor,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateContractor = async (req, res, next) => {
  const contractorId = req.params.contractorId;
  const {
    name,
    description,
    contactPerson,
    phoneNumber,
    email,
    balance,
  } = req.body;

  try {
    const contractor = await Contractor.findById(contractorId);
    if (!contractor) {
      const error = new Error("Could not find requested contractor.");
      error.statusCode = 404;
      throw error;
    }
    contractor.name = name;
    contractor.description = description;
    contractor.contactPerson = contactPerson;
    contractor.phoneNumber = phoneNumber;
    contractor.email = email;
    contractor.balance = balance;

    await contractor.save();
    res.status(200).json({
      message: "contractor updated.",
      contractor: contractor,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteContractor = async (req, res, next) => {
  const contractorId = req.params.contractorId;
  try {
    const contractor = await Contractor.findById(contractorId);
    if (!contractor) {
      const error = new Error("Could not find requested contractor.");
      error.statusCode = 404;
      throw error;
    }
    await Contractor.findByIdAndRemove(contractorId);
    res.status(200).json({
      message: "contractor deleted. ",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getContractor = async (req, res, next) => {
  const contractorId = req.params.contractorId;
  const { businessId } = req.query;
  try {
    const contractor = await Contractor.findById(contractorId);
    const obligations = await Obligation.find({
      business: businessId,
      contractor: contractor,
    });
    if (!contractor) {
      const error = new Error("Could not find requested contractor.");
      error.statusCode = 404;
      throw error;
    }
    const numbers = await Contractor.getNumbers2(businessId, contractorId);
    res.status(200).json({
      message: "Contractor fetched. ",
      contractor,
      numbers,
      obligations,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
