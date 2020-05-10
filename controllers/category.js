const Category = require("../models/category");
const Business = require("../models/business");

exports.getCategories = async (req, res, next) => {
  const businessId = req.body.businessId;
  try {
    const categories = await Category.find({
      business: businessId,
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
  const id = req.body.id;
  const isDeleted = req.body.isDeleted;
  const { name, isOwnerTransfer, kind, type, businessId } = req.body;
  try {
    if (id) {
      const category = await Category.findById(id);
      if (!category) {
        const error = new Error("Could not find requested category.");
        error.statusCode = 404;
        throw error;
      }
      if (isDeleted) {
        await Category.findByIdAndRemove(id);
        res.status(200).json({
          message: "Category deleted.",
          category: category,
        });
      } else {
        category.name = name;
        category.isOwnerTransfer = isOwnerTransfer;
        category.kind = kind;
        category.type = type;
        const updatedCategory = await category.save();
        res.status(200).json({
          message: "Category updated.",
          category: updatedCategory,
        });
      }
    } else {
      const newCategory = new Category({
        name,
        isOwnerTransfer,
        kind,
        type,
        business: businessId,
      });
      await newCategory.save();

      res.status(201).json({
        message: "Category created.",
        newCategory: newCategory,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
