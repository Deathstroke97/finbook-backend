const Category = require("../models/category");
const Transaction = require("../models/transaction");

exports.getCategories = async (req, res, next) => {
  const businessId = req.businessId;
  try {
    const categories = await Category.find({
      $or: [{ business: businessId }, { business: null }],
    });
    res.status(200).json({
      message: "Categories fetched successfully",
      categories: categories,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.postCategory = async (req, res, next) => {
  const businessId = req.businessId;
  const { name, isOwnerTransfer, kind, type } = req.body;
  try {
    const category = new Category({
      name,
      isOwnerTransfer,
      kind,
      type,
      business: businessId,
    });
    await category.save();

    res.status(201).json({
      message: "Category created.",
      category: category,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const { name } = req.body;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Could not find requested category.");
      error.statusCode = 404;
      throw error;
    }
    category.name = name;
    await category.save();
    res.status(200).json({
      message: "Category updated.",
      category,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Could not find requested category.");
      error.statusCode = 404;
      throw error;
    }
    Transaction.find({ category: categoryId })
      .cursor()
      .on("data", async function (transaction) {
        transaction.category = null;
        await transaction.save();
      })
      .on("end", async function () {
        await Category.findByIdAndRemove(categoryId);
        res.status(200).json({
          message: "category deleted. ",
        });
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
