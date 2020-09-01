const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is_auth");

const categoryController = require("../controllers/category");

router.get("/categories", isAuth, categoryController.getCategories);

router.post("/category", isAuth, categoryController.postCategory);

module.exports = router;
