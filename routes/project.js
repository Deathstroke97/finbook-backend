const express = require("express");

const router = express.Router();

const projectController = require("../controllers/project");

router.get("/projects", projectController.getProjects);

// router.post("/project", projectController.createProject);

// router.put("/project/:projectId", projectController.updatePost);

// router.delete("/project/:projectId", projectController.deletePost);

module.exports = router;
