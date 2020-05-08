const Category = require("../models/category");
const Business = require("../models/business");

exports.getCategories = async (req, res, next) => {
  const businessId = req.body.businessId;
  try {
    const categories = await Category.find({ business: businessId }).toArray();
    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
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
  const business = await Business.findById(businessId);
  try {
    if (id) {
      const category = await Category.findById(id);
      if (isDeleted) {
        await Category.findByIdAndRemove(id);
        business.categories.pull(id);
        await business.save();
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
      business.categories.push(newCategory);
      await business.save();
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
