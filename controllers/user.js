const Business = require("../models/business");
const User = require("../models/user");
const constants = require("../constants");

exports.updateUser = async (req, res, next) => {
  const businessId = req.businessId;
  const { email, name, mobileNumber } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { business: businessId },
      { email: email, name: name, mobileNumber: mobileNumber },
      { new: true }
    );

    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "user updated.",
      user: user,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  const businessId = req.businessId;
  try {
    const user = await User.findOne({ business: businessId });
    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "user fetched.",
      user: user._doc,
    });
  } catch (err) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
