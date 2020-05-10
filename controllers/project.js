const Project = require("../models/project");

exports.getProjects = async (req, res, next) => {
  const businessId = req.body.businessId;
  try {
    const projects = await Project.find({ business: businessId });
    res.status(200).json({
      message: "Projects fetched.",
      projects: projects,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  const businessId = req.body.businessId;
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
