const Contractor = require("../models/contractor");
const Transaction = require("../models/transaction");
const Obligation = require("../models/obligation");
const { transformToString } = require("../utils/functions");
const constants = require("../constants");

exports.getContractors = async (req, res, next) => {
  const businessId = req.businessId;
  const { startTime, endTime, page, rowsPerPage, name } = req.body;
  try {
    let query = {};
    query.business = businessId;
    if (startTime && endTime) {
      query.createdAt = {
        $gte: startTime,
        $lte: endTime,
      };
    }
    if (name) query.name = new RegExp("^" + name, "i");

    const contractors = await Contractor.find(query)
      .skip(page * rowsPerPage)
      .limit(rowsPerPage);

    for (const contractor of contractors) {
      const balance = await Contractor.getBalance(businessId, contractor._id);
      contractor.balance = balance;
      await contractor.save();
    }

    const totalItems = await Contractor.find(query).countDocuments();

    res.status(200).json({
      message: "contractors fetched.",
      contractors: transformToString(
        contractors,
        constants.COLLECTION_TYPE_CONTRACTOR
      ),
      totalItems,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createContractor = async (req, res, next) => {
  const businessId = req.businessId;
  const { name, description, contactName, phoneNumber, email } = req.body;
  const contractor = new Contractor({
    name,
    description,
    contactName,
    phoneNumber,
    email,

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
  const { name, description, contactName, phoneNumber, email } = req.body;

  try {
    const contractor = await Contractor.findById(contractorId);
    if (!contractor) {
      const error = new Error("Could not find requested contractor.");
      error.statusCode = 404;
      throw error;
    }
    contractor.name = name;
    contractor.description = description;
    contractor.contactName = contactName;
    contractor.phoneNumber = phoneNumber;
    contractor.email = email;

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
  const businessId = req.businessId;
  const contractorId = req.params.contractorId;
  const { startTime, endTime, page, rowsPerPage } = req.query;

  try {
    const contractor = await Contractor.findById(contractorId);
    if (!contractor) {
      const error = new Error("Could not find requested contractor.");
      error.statusCode = 404;
      throw error;
    }

    let transactionDates = {};
    if (startTime && endTime) {
      transactionDates = {
        date: {
          $gte: startTime,
          $lte: endTime,
        },
      };
    }

    const overallNumbers = await Contractor.getOverallNumbers(
      businessId,
      contractor._id,
      startTime,
      endTime
    );

    const balance = await Contractor.getBalance(businessId, contractorId);
    contractor.balance = balance;
    await contractor.save();

    //obligations
    let obligations = await Obligation.find({
      business: businessId,
      contractor: contractorId,
    })
      .populate("transaction")
      .sort({ date: -1, createdAt: -1 })
      .skip(+page * +rowsPerPage)
      .limit(+rowsPerPage);

    obligations = obligations.map((obligation) => {
      let withTransaction = {};
      if (obligation.transaction) {
        withTransaction.transaction = transformToString(
          [obligation.transaction],
          constants.COLLECTION_TYPE_TRANSACTION
        )[0];
      }
      return {
        ...obligation._doc,
        amount: parseFloat(obligation.amount).toFixed(2),
        ...withTransaction,
      };
    });

    const obligationTotalItems = await Obligation.find({
      contractor: contractorId,
      ...transactionDates,
    }).countDocuments();

    //transactions

    const transactions = await Transaction.find({
      contractor: contractorId,
      ...transactionDates,
    })
      .populate("account")
      .populate("project")
      .populate("category")
      .populate("contractor")
      .sort({ date: -1, createdAt: -1 })
      .skip(+page * +rowsPerPage)
      .limit(+rowsPerPage);

    const totalItems = await Transaction.find({
      contractor: contractorId,
      ...transactionDates,
    }).countDocuments();

    res.status(200).json({
      message: "Contractor fetched. ",
      // contractor: transformToString(
      //   [contractor],
      //   constants.COLLECTION_TYPE_CONTRACTOR
      // )[0],
      balance: +contractor.balance,
      overallNumbers,
      obligations,
      transactions: transformToString(
        transactions,
        constants.COLLECTION_TYPE_TRANSACTION
      ),
      totalItems,
      obligationTotalItems,
      contractor,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
