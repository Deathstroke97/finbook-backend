const Obligation = require("../models/obligation");
const moment = require("moment");

exports.getObligations = async (req, res, next) => {
  const businessId = req.body.businessId;
  try {
    const obligations = await Obligation.find({ business: businessId });
    res.status(200).json({
      message: "obligations fetched.",
      obligations: obligations,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createObligation = async (req, res, next) => {
  const businessId = req.businessId;
  const { amount, type, contractor, currency, description, date } = req.body;

  const obligation = new Obligation({
    business: businessId,
    amount,
    type,
    date,
    contractor,
    currency,
    description,
  });
  try {
    await obligation.save();
    res.status(201).json({
      message: "obligation created.",
      obligation: obligation,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateObligation = async (req, res, next) => {
  const obligationId = req.params.obligationId;
  const { amount, type, currency, description, date } = req.body;

  try {
    const obligation = await Obligation.findById(obligationId);
    if (!obligation) {
      const error = new Error("Could not find requested obligation.");
      error.statusCode = 404;
      throw error;
    }

    obligation.amount = amount;
    obligation.description = description;
    obligation.type = type;
    obligation.currency = currency;
    obligation.date = date;
    await obligation.save();
    res.status(200).json({
      message: "obligation updated.",
      obligation: obligation,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteObligation = async (req, res, next) => {
  const obligationId = req.params.obligationId;
  try {
    const obligation = await Obligation.findById(obligationId);
    if (!obligation) {
      const error = new Error("Could not find requested obligation.");
      error.statusCode = 404;
      throw error;
    }
    await Obligation.findByIdAndRemove(obligationId);
    res.status(200).json({
      message: "obligation deleted. ",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
