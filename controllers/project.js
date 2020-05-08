const Project = require("../models/project");
const Business = require("../models/business");

exports.getProjects = async (req, res, next) => {
  const businessid = req.body.businessId;
  try {
    const projects = await Business.findById(businessid)
      .populate("projects")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Products fetched successfully",
      projects,
    });
  } catch (err) {
    if (!error.statusCode) {
      err.statusCode = 500;
    }
    next(error);
  }
};
