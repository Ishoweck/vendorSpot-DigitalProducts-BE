"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWithdrawalStatus = exports.getAllWithdrawals = exports.getAdminDashboardStats = exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = exports.updateOrderStatus = exports.getOrderById = exports.getOrders = exports.updatePaymentStatus = exports.getPaymentById = exports.getPayments = exports.getProductById = exports.updateProductStatus = exports.deleteProduct = exports.updateProductApproval = exports.getProducts = exports.moderateReview = exports.getReviewsForModeration = exports.getWalletDetails = exports.updateVendorVerification = exports.getWalletByUserId = exports.getVendorById = exports.getAllVendors = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const Vendor_1 = require("../models/Vendor");
const Wallet_1 = require("../models/Wallet");
const Review_1 = require("../models/Review");
const Product_1 = require("../models/Product");
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const Category_1 = require("../models/Category");
const SocketService_1 = require("../services/SocketService");
const cloudinaryService_1 = require("../services/cloudinaryService");
const NotificationController_1 = require("./NotificationController");
const errorHandler_1 = require("../middleware/errorHandler");
const Withdrawal_1 = require("../models/Withdrawal");
const mongoose_1 = __importDefault(require("mongoose"));
exports.getAllUsers = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { role, status, search } = req.query;
    const filter = {};
    if (role)
        filter.role = role;
    if (status)
        filter.status = status;
    if (search) {
        const regex = new RegExp(String(search), "i");
        filter.$or = [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { phone: regex },
        ];
    }
    const total = await User_1.User.countDocuments(filter);
    const users = await User_1.User.find(filter)
        .select("-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires")
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
});
exports.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = id;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return next((0, errorHandler_1.createError)("Invalid user ID", 400));
    }
    const user = await User_1.User.findById(userId)
        .select("-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires")
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
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: user,
    });
});
exports.getAllVendors = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { verificationStatus, isActive, isSponsored, search } = req.query;
    const filter = {};
    if (verificationStatus)
        filter.verificationStatus = verificationStatus;
    if (isActive !== undefined)
        filter.isActive = isActive === "true";
    if (isSponsored !== undefined)
        filter.isSponsored = isSponsored === "true";
    if (search) {
        const regex = new RegExp(String(search), "i");
        filter.$or = [
            { businessName: regex },
            { businessEmail: regex },
            { businessPhone: regex },
            { taxId: regex },
        ];
    }
    const total = await Vendor_1.Vendor.countDocuments(filter);
    const vendors = await Vendor_1.Vendor.find(filter)
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
});
exports.getVendorById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = id;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return next((0, errorHandler_1.createError)("Invalid vendor ID", 400));
    }
    const vendor = await Vendor_1.Vendor.findById(userId)
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
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Vendor profile retrieved successfully",
        data: vendor,
    });
});
exports.getWalletByUserId = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return next((0, errorHandler_1.createError)("Invalid user ID", 400));
    }
    const wallet = await Wallet_1.Wallet.findOne({ userId }).select("-__v");
    if (!wallet) {
        return next((0, errorHandler_1.createError)("Wallet not found for user", 404));
    }
    res.status(200).json({
        success: true,
        message: "Wallet retrieved successfully",
        data: wallet,
    });
});
exports.updateVendorVerification = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { vendorId } = req.params;
    const { status, moderationReason } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid status", 400));
    }
    const vendor = await Vendor_1.Vendor.findById(vendorId);
    if (!vendor)
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    vendor.verificationStatus = status;
    if (status === "REJECTED") {
        vendor.verificationDocuments = [];
    }
    vendor.updatedAt = new Date();
    await vendor.save();
    res.json({ success: true, message: `Vendor verification updated to ${status}`, data: vendor });
});
exports.getWalletDetails = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.params;
    const wallet = await Wallet_1.Wallet.findOne({ userId });
    if (!wallet)
        return next((0, errorHandler_1.createError)("Wallet not found", 404));
    res.json({ success: true, data: wallet });
});
exports.getReviewsForModeration = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, status = "PENDING" } = req.query;
    const reviews = await Review_1.Review.find({ status })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ createdAt: -1 });
    const total = await Review_1.Review.countDocuments({ status });
    res.json({ success: true, data: reviews, total, page: +page, limit: +limit });
});
exports.moderateReview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { reviewId } = req.params;
    const { status, moderationReason } = req.body;
    if (!["APPROVED", "REJECTED", "HIDDEN"].includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid status", 400));
    }
    const review = await Review_1.Review.findById(reviewId);
    if (!review)
        return next((0, errorHandler_1.createError)("Review not found", 404));
    review.status = status;
    review.moderationReason = moderationReason || "";
    review.updatedAt = new Date();
    await review.save();
    res.json({ success: true, message: `Review ${status.toLowerCase()}`, data: review });
});
exports.getProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, approvalStatus, vendorId, categoryId, isActive, isFeatured, } = req.query;
    const filter = {};
    if (approvalStatus)
        filter.approvalStatus = approvalStatus;
    if (vendorId)
        filter.vendorId = vendorId;
    if (categoryId)
        filter.categoryId = categoryId;
    if (isActive !== undefined)
        filter.isActive = isActive === "true";
    if (isFeatured !== undefined)
        filter.isFeatured = isFeatured === "true";
    const products = await Product_1.Product.find(filter)
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ createdAt: -1 });
    const total = await Product_1.Product.countDocuments(filter);
    res.json({ success: true, data: products, total, page: +page, limit: +limit });
});
exports.updateProductApproval = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { productId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(approvalStatus)) {
        return next((0, errorHandler_1.createError)("Invalid approval status", 400));
    }
    const product = await Product_1.Product.findById(productId);
    if (!product)
        return next((0, errorHandler_1.createError)("Product not found", 404));
    product.approvalStatus = approvalStatus;
    product.isApproved = approvalStatus === "APPROVED";
    product.rejectionReason = approvalStatus === "REJECTED" ? rejectionReason : undefined;
    product.updatedAt = new Date();
    await product.save();
    res.json({ success: true, message: `Product ${approvalStatus.toLowerCase()}`, data: product });
});
exports.deleteProduct = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const role = user.role;
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    const product = await Product_1.Product.findOne({ _id: req.params.productId });
    const vendorId = product.vendorId;
    if (!vendorId) {
        console.log("No Vendor Id", vendorId);
        console.log();
    }
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    const urlsToDelete = [];
    if (product.fileUrl) {
        urlsToDelete.push(product.fileUrl);
    }
    if (product.thumbnail) {
        urlsToDelete.push(product.thumbnail);
    }
    if (product.images && product.images.length > 0) {
        urlsToDelete.push(...product.images);
    }
    await Product_1.Product.findByIdAndDelete(req.params.productId);
    if (urlsToDelete.length > 0) {
        cloudinaryService_1.cloudinaryService.deleteMultipleFiles(urlsToDelete).catch((error) => {
            console.error("Failed to delete files from Cloudinary:", error);
        });
    }
    try {
        const io = SocketService_1.SocketService.getIO();
        io.emit("product:deleted", {
            productId: req.params.productId,
            vendorId: product.vendorId,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: product.vendorId.toString(),
            type: "PRODUCT_DISCONTINUED",
            title: "Product Deleted By Admin",
            message: `Your product "${product.name}" has been deleted By VendorSpot Admin. If you believe your product was wrongfully deleted, Kindly Contact Support`,
            category: "PRODUCT",
            priority: "NORMAL",
            channels: ["IN_APP"],
            data: {
                productId: product._id,
                productName: product.name,
            },
        });
    }
    catch (error) {
        console.error("Failed to create product deletion notification:", error);
    }
    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});
exports.updateProductStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { productId } = req.params;
    const { isActive, isFeatured } = req.body;
    const product = await Product_1.Product.findById(productId);
    if (!product)
        return next((0, errorHandler_1.createError)("Product not found", 404));
    if (typeof isActive === "boolean") {
        product.isActive = isActive;
    }
    if (typeof isFeatured === "boolean") {
        product.isFeatured = isFeatured;
    }
    product.updatedAt = new Date();
    await product.save();
    res.json({ success: true, message: "Product status updated", data: product });
});
exports.getProductById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Product_1.Product.findById(productId);
    if (!product)
        return next((0, errorHandler_1.createError)("Product not found", 404));
    res.json({ success: true, data: product });
});
exports.getPayments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, status, gateway, userId, startDate, endDate, } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    if (gateway)
        filter.gateway = gateway;
    if (userId)
        filter.userId = userId;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate)
            filter.createdAt.$gte = new Date(startDate);
        if (endDate)
            filter.createdAt.$lte = new Date(endDate);
    }
    const payments = await Payment_1.Payment.find(filter)
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ createdAt: -1 });
    const total = await Payment_1.Payment.countDocuments(filter);
    res.json({ success: true, data: payments, total, page: +page, limit: +limit });
});
exports.getPaymentById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { paymentId } = req.params;
    const payment = await Payment_1.Payment.findById(paymentId);
    if (!payment)
        return next((0, errorHandler_1.createError)("Payment not found", 404));
    res.json({ success: true, data: payment });
});
exports.updatePaymentStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { paymentId } = req.params;
    const { status, refundAmount, refundReference, refundedAt, failureReason } = req.body;
    if (!["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"].includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid payment status", 400));
    }
    const payment = await Payment_1.Payment.findById(paymentId);
    if (!payment)
        return next((0, errorHandler_1.createError)("Payment not found", 404));
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
});
exports.getOrders = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { page = "1", limit = "20", status, paymentStatus, vendorId, userId, startDate, endDate, } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    if (paymentStatus)
        filter.paymentStatus = paymentStatus;
    if (vendorId)
        filter["items.vendorId"] = vendorId;
    if (userId)
        filter.userId = userId;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate)
            filter.createdAt.$gte = new Date(startDate);
        if (endDate)
            filter.createdAt.$lte = new Date(endDate);
    }
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const orders = await Order_1.Order.find(filter)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .sort({ createdAt: -1 });
    const total = await Order_1.Order.countDocuments(filter);
    res.json({
        success: true,
        data: orders,
        total,
        page: pageNumber,
        limit: limitNumber,
    });
});
exports.getOrderById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { orderId } = req.params;
    const order = await Order_1.Order.findById(orderId);
    if (!order)
        return next((0, errorHandler_1.createError)("Order not found", 404));
    res.json({ success: true, data: order });
});
exports.updateOrderStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { orderId } = req.params;
    const { status, paymentStatus, trackingNumber, cancellationReason, refundAmount, refundReason, } = req.body;
    const allowedStatus = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
    ];
    const allowedPaymentStatus = [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
    ];
    if (status && !allowedStatus.includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid order status", 400));
    }
    if (paymentStatus && !allowedPaymentStatus.includes(paymentStatus)) {
        return next((0, errorHandler_1.createError)("Invalid payment status", 400));
    }
    const order = await Order_1.Order.findById(orderId);
    if (!order)
        return next((0, errorHandler_1.createError)("Order not found", 404));
    if (status)
        order.status = status;
    if (paymentStatus)
        order.paymentStatus = paymentStatus;
    if (trackingNumber)
        order.trackingNumber = trackingNumber;
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
});
exports.createCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, slug, description, image, parentId, isActive, sortOrder } = req.body;
    const existing = await Category_1.Category.findOne({ slug });
    if (existing) {
        return next((0, errorHandler_1.createError)("Slug already in use", 400));
    }
    const category = new Category_1.Category({
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
});
exports.getCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }
    const categories = await Category_1.Category.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(categories);
});
exports.getCategoryById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const category = await Category_1.Category.findById(req.params.id);
    if (!category) {
        return next((0, errorHandler_1.createError)("Category not found", 404));
    }
    res.json(category);
});
exports.updateCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, slug, description, image, parentId, isActive, sortOrder } = req.body;
    const category = await Category_1.Category.findById(req.params.id);
    if (!category) {
        return next((0, errorHandler_1.createError)("Category not found", 404));
    }
    if (slug && slug !== category.slug) {
        const slugExists = await Category_1.Category.findOne({ slug });
        if (slugExists) {
            return next((0, errorHandler_1.createError)("Slug already in use", 400));
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
});
exports.deleteCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const category = await Category_1.Category.findById(req.params.id);
    if (!category) {
        return next((0, errorHandler_1.createError)("Category not found", 404));
    }
    await Category_1.Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
});
exports.getAdminDashboardStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const [totalUsers, activeUsers, inactiveUsers, totalVendors, verifiedVendors, pendingVendors, totalProducts, approvedProducts, pendingProducts, rejectedProducts, totalOrders, totalRevenue, ordersByStatus, totalPayments, totalReviews, pendingReviews, approvedReviews, rejectedReviews, totalCategories,] = await Promise.all([
            User_1.User.countDocuments(),
            User_1.User.countDocuments({ status: "ACTIVE" }),
            User_1.User.countDocuments({ status: "INACTIVE" }),
            Vendor_1.Vendor.countDocuments(),
            Vendor_1.Vendor.countDocuments({ verificationStatus: "APPROVED" }),
            Vendor_1.Vendor.countDocuments({ verificationStatus: "PENDING" }),
            Product_1.Product.countDocuments(),
            Product_1.Product.countDocuments({ approvalStatus: "APPROVED" }),
            Product_1.Product.countDocuments({ approvalStatus: "PENDING" }),
            Product_1.Product.countDocuments({ approvalStatus: "REJECTED" }),
            Order_1.Order.countDocuments(),
            Order_1.Order.aggregate([
                { $match: { paymentStatus: "PAID" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                    },
                },
            ]),
            Order_1.Order.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Payment_1.Payment.countDocuments(),
            Review_1.Review.countDocuments(),
            Review_1.Review.countDocuments({ status: "PENDING" }),
            Review_1.Review.countDocuments({ status: "APPROVED" }),
            Review_1.Review.countDocuments({ status: "REJECTED" }),
            Category_1.Category.countDocuments(),
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
                    byStatus: ordersByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAllWithdrawals = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    let { page = "1", limit = "20", status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
        return next((0, errorHandler_1.createError)("Invalid page number", 400));
    }
    if (isNaN(limitNum) || limitNum < 1) {
        return next((0, errorHandler_1.createError)("Invalid limit number", 400));
    }
    const query = {};
    if (status) {
        query.status = status;
    }
    const total = await Withdrawal_1.Withdrawal.countDocuments(query);
    const withdrawals = await Withdrawal_1.Withdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
    res.status(200).json({
        success: true,
        count: withdrawals.length,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalWithdrawals: total,
        data: withdrawals,
    });
});
exports.updateWithdrawalStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { withdrawalId } = req.params;
    const { status } = req.body;
    if (!["PENDING", "APPROVED", "REJECTED", "COMPLETED"].includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid status value", 400));
    }
    const withdrawal = await Withdrawal_1.Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
        return next((0, errorHandler_1.createError)("Withdrawal not found", 404));
    }
    withdrawal.status = status;
    await withdrawal.save();
    try {
        await (0, NotificationController_1.createNotification)({
            userId: withdrawal.userId.toString(),
            type: "PAYMENT_SUCCESS",
            title: "Withdrawal Status Updated",
            message: `Your withdrawal with reference ${withdrawal.reference} is now ${status}.`,
            category: "PAYMENT",
            priority: "HIGH",
            channels: ["IN_APP"],
            data: {
                withdrawalId: withdrawal._id,
                status,
                amount: withdrawal.amount,
            },
        });
    }
    catch (error) {
        console.error("Failed to create withdrawal status update notification:", error);
    }
    res.status(200).json({
        success: true,
        message: `Withdrawal status updated to ${status}`,
        data: withdrawal,
    });
});
//# sourceMappingURL=AdminController.js.map