import { Request, Response, NextFunction } from "express";
import { Category } from "@/models/Category";
import { asyncHandler, createError } from "@/middleware/errorHandler";

export const getCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find({ isActive: true }).sort({
      sortOrder: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  }
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(createError("Category not found", 404));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, parentId } = req.body;

    if (!name) {
      return next(createError("Category name is required", 400));
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return next(createError("Category with this name already exists", 409));
    }

    const category = await Category.create({
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
  }
);
