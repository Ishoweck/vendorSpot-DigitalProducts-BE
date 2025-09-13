"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const Category_1 = require("@/models/Category");
const errorHandler_1 = require("@/middleware/errorHandler");
exports.getCategories = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const categories = await Category_1.Category.find({ isActive: true }).sort({
        sortOrder: 1,
        name: 1,
    });
    res.status(200).json({
        success: true,
        data: categories,
    });
});
exports.getCategoryById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const category = await Category_1.Category.findById(req.params.id);
    if (!category) {
        return next((0, errorHandler_1.createError)("Category not found", 404));
    }
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.createCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, description, parentId } = req.body;
    if (!name) {
        return next((0, errorHandler_1.createError)("Category name is required", 400));
    }
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const existingCategory = await Category_1.Category.findOne({ slug });
    if (existingCategory) {
        return next((0, errorHandler_1.createError)("Category with this name already exists", 409));
    }
    const category = await Category_1.Category.create({
        name,
        slug,
        description,
        parentId,
    });
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
    });
});
//# sourceMappingURL=categoryController.js.map