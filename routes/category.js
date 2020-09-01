const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is_auth");

const categoryController = require("../controllers/category");

router.get("/categories", isAuth, categoryController.getCategories);

router.post("/category", isAuth, categoryController.postCategory);

router.put("/category/:categoryId", isAuth, categoryController.updateCategory);

router.delete(
  "/category/:categoryId",
  isAuth,
  categoryController.deleteCategory
);

module.exports = router;
