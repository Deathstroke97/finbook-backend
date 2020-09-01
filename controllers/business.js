const Business = require("../models/business");
const User = require("../models/user");
const constants = require("../constants");

exports.updateBusiness = async (req, res, next) => {
  const businessId = req.businessId;
  const { name, currency } = req.body;

  try {
    const business = await Business.findById(businessId);
    const user = await User.findOneAndUpdate(
      { business: businessId },
      { businessName: name },
      { new: true }
    );

    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404;
      throw error;
    }

    if (!business) {
      const error = new Error("Could not find requested business.");
      error.statusCode = 404;
      throw error;
    }
    business.name = name;
    business.currency = currency;

    await business.save();
    res.status(200).json({
      message: "business updated.",
      business: business,
      user: user,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getBusiness = async (req, res, next) => {
  const businessId = req.businessId;
  try {
    const business = await Business.findById(businessId);
    if (!business) {
      const error = new Error("Could not find business.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "business fetched.",
      business: business,
    });
  } catch (err) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
