const User = require("../models/user");
const Business = require("../models/business");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const businessName = req.body.businessName;
  const password = req.body.password;

  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      // _id: "5eb41e8ecc207a08995b43c1",
      email: email,
      password: hashedPw,
    });
    const newUser = await user.save();

    const business = new Business({
      name: businessName,
      owner: newUser._id,
      totalIncome: 0,
      totalOutcome: 0,
      totalBalance: 0,
    });
    await business.save();
    newUser.businesses.push(business);
    await newUser.save();
    res.status(201).json({
      message: "User created!",
      userId: newUser._id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be founded");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      { email: email, userId: loadedUser._id.toString() },
      "somesupersecret"
      // { expiresIn: "1h" }
    );
    res.status(200).json({
      token: token,
      userId: loadedUser._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
