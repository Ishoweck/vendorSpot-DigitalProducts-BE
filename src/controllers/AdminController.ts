import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Vendor } from "../models/Vendor"; 
import { Wallet } from "../models/Wallet"; 
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { Payment } from "../models/Payment";
import { Order, IOrder } from "../models/Order";
import { Category, ICategory } from "../models/Category";

import { asyncHandler, createError } from "../middleware/errorHandler";
import mongoose, { FilterQuery } from "mongoose";

interface QueryFilters {
  page?: string;
  limit?: string;
  status?: string;
  paymentStatus?: string;
  vendorId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateOrderStatusBody {
  status?: IOrder["status"];
  paymentStatus?: IOrder["paymentStatus"];
  trackingNumber?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundReason?: string;
}


export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { role, status, search } = req.query;

    const filter: any = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);


export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
   const {id} = req.params;
   const userId = id


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(createError("Invalid user ID", 400));
    }

    const user = await User.findById(userId)
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires"
      )
      .populate([
        {
          path: "wishlist",
          select: "name price thumbnail vendorId categoryId",
          populate: [
            { path: "vendorId", select: "businessName" },
            { path: "categoryId", select: "name" },
          ],
        },
        {
          path: "cart.items.productId",
          select: "name price thumbnail vendorId categoryId",
          populate: [
            { path: "vendorId", select: "businessName" },
            { path: "categoryId", select: "name" },
          ],
        },
      ]);

    if (!user) {
      return next(createError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  }
);


export const getAllVendors = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { verificationStatus, isActive, isSponsored, search } = req.query;

    const filter: any = {};

    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (isSponsored !== undefined) filter.isSponsored = isSponsored === "true";

    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [
        { businessName: regex },
        { businessEmail: regex },
        { businessPhone: regex },
        { taxId: regex },
      ];
    }

    const total = await Vendor.countDocuments(filter);
    const vendors = await Vendor.find(filter)
      .populate({
        path: "userId",
        select: "firstName lastName email phone",
      })
      .select("-verificationDocuments")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Vendors retrieved successfully",
      data: vendors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);


export const getVendorById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
   const {id} = req.params
  const userId = id


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(createError("Invalid vendor ID", 400));
    }

    const vendor = await Vendor.findById(userId)
      .populate([
        {
          path: "userId",
          select: "firstName lastName email phone status role",
        },
        {
          path: "walletId",
          select: "balance transactions",
        },
      ]);

    if (!vendor) {
      return next(createError("Vendor not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Vendor profile retrieved successfully",
      data: vendor,
    });
  }
);



export const getWalletByUserId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(createError("Invalid user ID", 400));
    }

    const wallet = await Wallet.findOne({ userId }).select("-__v");

    if (!wallet) {
      return next(createError("Wallet not found for user", 404));
    }

    res.status(200).json({
      success: true,
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  }
);


export const updateVendorVerification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vendorId } = req.params;
    const { status, moderationReason } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return next(createError("Invalid status", 400));
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return next(createError("Vendor not found", 404));

    vendor.verificationStatus = status;
    if (status === "REJECTED") {
      vendor.verificationDocuments = [];
    }
    vendor.updatedAt = new Date();

    await vendor.save();

    res.json({ success: true, message: `Vendor verification updated to ${status}`, data: vendor });
  }
);


export const getWalletDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const wallet = await Wallet.findOne({ userId });
  if (!wallet) return next(createError("Wallet not found", 404));

  res.json({ success: true, data: wallet });
});


export const getReviewsForModeration = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status = "PENDING" } = req.query;

  const reviews = await Review.find({ status })
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments({ status });

  res.json({ success: true, data: reviews, total, page: +page, limit: +limit });
});


export const moderateReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;
  const { status, moderationReason } = req.body;

  if (!["APPROVED", "REJECTED", "HIDDEN"].includes(status)) {
    return next(createError("Invalid status", 400));
  }

  const review = await Review.findById(reviewId);
  if (!review) return next(createError("Review not found", 404));

  review.status = status;
  review.moderationReason = moderationReason || "";
  review.updatedAt = new Date();

  await review.save();

  res.json({ success: true, message: `Review ${status.toLowerCase()}`, data: review });
});


export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    approvalStatus,
    vendorId,
    categoryId,
    isActive,
    isFeatured,
  } = req.query;

  const filter: any = {};

  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (vendorId) filter.vendorId = vendorId;
  if (categoryId) filter.categoryId = categoryId;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

  const products = await Product.find(filter)
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);

  res.json({ success: true, data: products, total, page: +page, limit: +limit });
});

export const updateProductApproval = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(approvalStatus)) {
      return next(createError("Invalid approval status", 400));
    }

    const product = await Product.findById(productId);
    if (!product) return next(createError("Product not found", 404));

    product.approvalStatus = approvalStatus;
    product.isApproved = approvalStatus === "APPROVED";
    product.rejectionReason = approvalStatus === "REJECTED" ? rejectionReason : undefined;
    product.updatedAt = new Date();

    await product.save();

    res.json({ success: true, message: `Product ${approvalStatus.toLowerCase()}`, data: product });
  }
);

export const updateProductStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { isActive, isFeatured } = req.body;

    const product = await Product.findById(productId);
    if (!product) return next(createError("Product not found", 404));

    if (typeof isActive === "boolean") {
      product.isActive = isActive;
    }
    if (typeof isFeatured === "boolean") {
      product.isFeatured = isFeatured;
    }

    product.updatedAt = new Date();

    await product.save();

    res.json({ success: true, message: "Product status updated", data: product });
  }
);

export const getProductById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) return next(createError("Product not found", 404));

  res.json({ success: true, data: product });
});


export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    status,
    gateway,
    userId,
    startDate,
    endDate,
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (gateway) filter.gateway = gateway;
  if (userId) filter.userId = userId;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  const payments = await Payment.find(filter)
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .sort({ createdAt: -1 });

  const total = await Payment.countDocuments(filter);

  res.json({ success: true, data: payments, total, page: +page, limit: +limit });
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) return next(createError("Payment not found", 404));

  res.json({ success: true, data: payment });
});

export const updatePaymentStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { status, refundAmount, refundReference, refundedAt, failureReason } = req.body;

    if (!["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"].includes(status)) {
      return next(createError("Invalid payment status", 400));
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) return next(createError("Payment not found", 404));

    payment.status = status;

    if (status === "REFUNDED") {
      payment.refundAmount = refundAmount;
      payment.refundReference = refundReference;
      payment.refundedAt = refundedAt ? new Date(refundedAt) : new Date();
    }

    if (status === "FAILED" && failureReason) {
      payment.failureReason = failureReason;
    }

    await payment.save();

    res.json({ success: true, message: `Payment marked as ${status.toLowerCase()}`, data: payment });
  }
);



export const getOrders = asyncHandler(
  async (req: Request<{}, {}, {}, QueryFilters>, res: Response, next: NextFunction) => {
    const {
      page = "1",
      limit = "20",
      status,
      paymentStatus,
      vendorId,
      userId,
      startDate,
      endDate,
    } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (vendorId) filter["items.vendorId"] = vendorId;
    if (userId) filter.userId = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const orders = await Order.find(filter)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      total,
      page: pageNumber,
      limit: limitNumber,
    });
  }
);


export const getOrderById = asyncHandler(
  async (req: Request<{ orderId: string }>, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return next(createError("Order not found", 404));

    res.json({ success: true, data: order });
  }
);


export const updateOrderStatus = asyncHandler(
  async (
    req: Request<{ orderId: string }, {}, UpdateOrderStatusBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { orderId } = req.params;
    const {
      status,
      paymentStatus,
      trackingNumber,
      cancellationReason,
      refundAmount,
      refundReason,
    } = req.body;

    const allowedStatus: IOrder["status"][] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];
    const allowedPaymentStatus: IOrder["paymentStatus"][] = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    if (status && !allowedStatus.includes(status)) {
      return next(createError("Invalid order status", 400));
    }
    if (paymentStatus && !allowedPaymentStatus.includes(paymentStatus)) {
      return next(createError("Invalid payment status", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) return next(createError("Order not found", 404));

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (status === "CANCELLED" && cancellationReason) {
      order.cancellationReason = cancellationReason;
      order.cancelledAt = new Date();
    }

    if (status === "REFUNDED") {
      order.refundAmount = refundAmount;
      order.refundReason = refundReason;
    }

    await order.save();

    res.json({ success: true, message: "Order updated", data: order });
  }
);


export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, slug, description, image, parentId, isActive, sortOrder } = req.body;

    // Check if slug already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return next(createError("Slug already in use", 400));
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      parentId,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    });

    await category.save();

    res.status(201).json({ message: "Category created", category });
  }
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { isActive } = req.query;

    
    const filter: FilterQuery<ICategory> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: -1 });

    res.json(categories);
  }
);


export const getCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(createError("Category not found", 404));
    }
    res.json(category);
  }
);


export const updateCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, slug, description, image, parentId, isActive, sortOrder } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(createError("Category not found", 404));
    }

    if (slug && slug !== category.slug) {
      const slugExists = await Category.findOne({ slug });
      if (slugExists) {
        return next(createError("Slug already in use", 400));
      }
      category.slug = slug;
    }

    category.name = name ?? category.name;
    category.description = description ?? category.description;
    category.image = image ?? category.image;
    category.parentId = parentId ?? category.parentId;
    category.isActive = isActive ?? category.isActive;
    category.sortOrder = sortOrder ?? category.sortOrder;

    await category.save();

    res.json({ message: "Category updated", category });
  }
);


export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(createError("Category not found", 404));
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category deleted" });
  }
);

export const getAdminDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalVendors,
        verifiedVendors,
        pendingVendors,
        totalProducts,
        approvedProducts,
        pendingProducts,
        rejectedProducts,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        totalPayments,
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        totalCategories,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: "ACTIVE" }),
        User.countDocuments({ status: "INACTIVE" }),

        Vendor.countDocuments(),
        Vendor.countDocuments({ verificationStatus: "APPROVED" }),
        Vendor.countDocuments({ verificationStatus: "PENDING" }),

        Product.countDocuments(),
        Product.countDocuments({ approvalStatus: "APPROVED" }),
        Product.countDocuments({ approvalStatus: "PENDING" }),
        Product.countDocuments({ approvalStatus: "REJECTED" }),

        Order.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: "PAID" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),

        Order.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        Payment.countDocuments(),

        Review.countDocuments(),
        Review.countDocuments({ status: "PENDING" }),
        Review.countDocuments({ status: "APPROVED" }),
        Review.countDocuments({ status: "REJECTED" }),

        Category.countDocuments(),
      ]);

      const revenue = totalRevenue[0]?.totalRevenue || 0;

      res.status(200).json({
        success: true,
        message: "Admin dashboard stats retrieved successfully",
        data: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
          },
          vendors: {
            total: totalVendors,
            verified: verifiedVendors,
            pending: pendingVendors,
          },
          products: {
            total: totalProducts,
            approved: approvedProducts,
            pending: pendingProducts,
            rejected: rejectedProducts,
          },
          orders: {
            total: totalOrders,
            revenue,
            byStatus: ordersByStatus.reduce(
              (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
              {}
            ),
          },
          payments: {
            total: totalPayments,
          },
          reviews: {
            total: totalReviews,
            pending: pendingReviews,
            approved: approvedReviews,
            rejected: rejectedReviews,
          },
          categories: {
            total: totalCategories,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
