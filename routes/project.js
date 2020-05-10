const express = require("express");

const router = express.Router();

const projectController = require("../controllers/project");

router.post("/projects", projectController.getProjects);

router.post("/project", projectController.createProject);

router.put("/project/:projectId", projectController.updateProject);

router.delete("/project/:projectId", projectController.deleteProject);

module.exports = router;
