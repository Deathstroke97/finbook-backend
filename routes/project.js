const express = require("express");

const router = express.Router();

const projectController = require("../controllers/project");

const isAuth = require("../middleware/is_auth");

router.get("/projects", isAuth, projectController.getProjects);

router.post("/project", isAuth, projectController.createProject);

router.put("/project/:projectId", isAuth, projectController.updateProject);

router.delete("/project/:projectId", isAuth, projectController.deleteProject);

router.get("/project/:projectId", isAuth, projectController.getProject);

module.exports = router;
