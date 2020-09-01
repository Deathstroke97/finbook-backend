const express = require("express");

const router = express.Router();

const userController = require("../controllers/user");

const isAuth = require("../middleware/is_auth");

router.put("/user", isAuth, userController.updateUser);

router.get("/user", isAuth, userController.getUser);

module.exports = router;
