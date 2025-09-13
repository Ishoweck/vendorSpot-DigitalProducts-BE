"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportReview = exports.markReviewHelpful = exports.respondToReview = exports.deleteReview = exports.updateReview = exports.getUserReviews = exports.getProductReviews = exports.createReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Review_1 = require("@/models/Review");
const Product_1 = require("@/models/Product");
const Order_1 = require("@/models/Order");
const Vendor_1 = require("@/models/Vendor");
const cloudinaryService_1 = require("@/services/cloudinaryService");
const errorHandler_1 = require("@/middleware/errorHandler");
const SocketService_1 = require("@/services/SocketService");
const NotificationController_1 = require("./NotificationController");
exports.createReview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId, orderId, rating, title, comment } = req.body;
    if (!productId || !orderId || !rating) {
        return next((0, errorHandler_1.createError)("Product ID, Order ID, and rating are required", 400));
    }
    if (rating < 1 || rating > 5) {
        return next((0, errorHandler_1.createError)("Rating must be between 1 and 5", 400));
    }
    const product = await Product_1.Product.findById(productId);
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    const order = await Order_1.Order.findOne({
        _id: orderId,
        userId: user._id,
        status: "DELIVERED",
        "items.productId": productId,
    });
    if (!order) {
        return next((0, errorHandler_1.createError)("Order not found or not delivered", 404));
    }
    const existingReview = await Review_1.Review.findOne({
        userId: user._id,
        productId,
    });
    if (existingReview) {
        return next((0, errorHandler_1.createError)("You have already reviewed this product", 400));
    }
    const images = [];
    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            const imageUpload = await cloudinaryService_1.cloudinaryService.uploadFile(file, "reviews/images");
            images.push(imageUpload.url);
        }
    }
    const review = await Review_1.Review.create({
        productId,
        userId: user._id,
        vendorId: product.vendorId,
        orderId,
        rating,
        title,
        comment,
        images,
        isVerified: true,
        status: "APPROVED",
    });
    await updateProductRating(productId);
    try {
        const io = SocketService_1.SocketService.getIO();
        io.to(product.vendorId.toString()).emit("review:created", {
            reviewId: review._id,
            productId,
            rating,
            userName: `${user.firstName} ${user.lastName}`,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: String(user._id),
            type: "REVIEW_ADDED",
            title: "Review Submitted Successfully",
            message: `Your review for "${product.name}" has been submitted successfully.`,
            category: "REVIEW",
            priority: "NORMAL",
            channels: ["IN_APP"],
            data: {
                reviewId: review._id,
                productId,
                productName: product.name,
            },
        });
    }
    catch (error) {
        console.error("Failed to create review notification:", error);
    }
    res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
    });
});
exports.getProductReviews = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
    const query = {
        productId: productObjectId,
        status: "APPROVED",
    };
    if (req.query.rating) {
        query.rating = parseInt(req.query.rating);
    }
    const reviews = await Review_1.Review.find(query)
        .populate("userId", "firstName lastName avatar")
        .populate("response.respondedBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Review_1.Review.countDocuments(query);
    const ratingDistribution = await Review_1.Review.aggregate([
        { $match: { productId: productObjectId, status: "APPROVED" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
    ]);
    const avgRating = await Review_1.Review.aggregate([
        { $match: { productId: productObjectId, status: "APPROVED" } },
        { $group: { _id: null, average: { $avg: "$rating" } } },
    ]);
    const currentUserId = req.user?._id?.toString();
    const reviewsWithHelpful = reviews.map((r) => ({
        ...r.toObject(),
        isHelpful: currentUserId
            ? (r.helpfulBy || []).some((id) => id.toString() === currentUserId)
            : false,
        isReported: currentUserId
            ? (r.reportedBy || []).some((id) => id.toString() === currentUserId)
            : false,
    }));
    res.status(200).json({
        success: true,
        data: {
            reviews: reviewsWithHelpful,
            stats: {
                total,
                averageRating: avgRating[0]
                    ? Math.round(avgRating[0].average * 10) / 10
                    : 0,
                ratingDistribution,
            },
        },
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.getUserReviews = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const reviews = await Review_1.Review.find({ userId: user._id })
        .populate("productId", "name thumbnail")
        .populate("vendorId", "businessName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Review_1.Review.countDocuments({ userId: user._id });
    res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.updateReview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { rating, title, comment } = req.body;
    const review = await Review_1.Review.findOne({
        _id: req.params.id,
        userId: user._id,
    });
    if (!review) {
        return next((0, errorHandler_1.createError)("Review not found", 404));
    }
    if (rating && (rating < 1 || rating > 5)) {
        return next((0, errorHandler_1.createError)("Rating must be between 1 and 5", 400));
    }
    if (rating)
        review.rating = rating;
    if (title)
        review.title = title;
    if (comment)
        review.comment = comment;
    review.status = "PENDING";
    await review.save();
    await updateProductRating(review.productId.toString());
    res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
    });
});
exports.deleteReview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const review = await Review_1.Review.findOne({
        _id: req.params.id,
        userId: user._id,
    });
    if (!review) {
        return next((0, errorHandler_1.createError)("Review not found", 404));
    }
    if (review.images && review.images.length > 0) {
        for (const imageUrl of review.images) {
            cloudinaryService_1.cloudinaryService.deleteFile(imageUrl).catch(console.error);
        }
    }
    await Review_1.Review.findByIdAndDelete(req.params.id);
    await updateProductRating(review.productId.toString());
    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});
exports.respondToReview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { message } = req.body;
    if (!message) {
        return next((0, errorHandler_1.createError)("Response message is required", 400));
    }
    const review = await Review_1.Review.findById(req.params.id).populate({
        path: "productId",
        select: "vendorId",
    });
    if (!review) {
        return next((0, errorHandler_1.createError)("Review not found", 404));
    }
    const vendor = (await Vendor_1.Vendor.findOne({ userId: user._id }));
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Only vendors can respond to reviews", 403));
    }
    if (vendor._id.toString() !== review.productId.vendorId.toString()) {
        return next((0, errorHandler_1.createError)("Unauthorized to respond to this review", 403));
    }
    review.response = {
        message,
        respondedAt: new Date(),
        respondedBy: user._id,
    };
    await review.save();
    try {
        const io = SocketService_1.SocketService.getIO();
        io.to(review.userId.toString()).emit("review:response", {
            reviewId: review._id,
            vendorName: vendor.businessName,
            message,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: String(review.userId),
            type: "REVIEW_RESPONSE",
            title: "Vendor Responded to Your Review",
            message: `${vendor.businessName} responded to your review: "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`,
            category: "REVIEW",
            priority: "NORMAL",
            channels: ["IN_APP", "EMAIL"],
            data: {
                reviewId: review._id,
                vendorName: vendor.businessName,
                message,
            },
        });
    }
    catch (error) {
        console.error("Failed to create review response notification:", error);
    }
    res.status(200).json({
        success: true,
        message: "Response added successfully",
        data: review,
    });
});
exports.markReviewHelpful = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const review = await Review_1.Review.findById(req.params.id);
    if (!review) {
        return next((0, errorHandler_1.createError)("Review not found", 404));
    }
    const userIdStr = user._id.toString();
    const hasVoted = (review.helpfulBy || []).some((id) => id.toString() === userIdStr);
    if (hasVoted) {
        review.helpfulBy = (review.helpfulBy || []).filter((id) => id.toString() !== userIdStr);
        review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
    }
    else {
        review.helpfulBy = [...(review.helpfulBy || []), user._id];
        review.helpfulCount = (review.helpfulCount || 0) + 1;
        try {
            await (0, NotificationController_1.createNotification)({
                userId: String(review.userId),
                type: "REVIEW_HELPFUL",
                title: "Someone found your review helpful",
                message: `"${(review.title || review.comment || "").toString().slice(0, 80)}" was marked helpful`,
                category: "REVIEW",
                priority: "NORMAL",
                channels: ["IN_APP"],
                data: {
                    reviewId: review._id,
                    productId: review.productId,
                    helpfulCount: review.helpfulCount,
                },
            });
        }
        catch (err) {
            console.error("Failed to send helpful notification:", err);
        }
    }
    await review.save();
    res.status(200).json({
        success: true,
        message: hasVoted ? "Removed helpful vote" : "Marked as helpful",
        data: {
            helpfulCount: review.helpfulCount,
            isHelpful: !hasVoted,
        },
    });
});
exports.reportReview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { reason } = req.body;
    const review = await Review_1.Review.findById(req.params.id);
    if (!review) {
        return next((0, errorHandler_1.createError)("Review not found", 404));
    }
    const userIdStr = user._id.toString();
    const hasReported = (review.reportedBy || []).some((id) => id.toString() === userIdStr);
    if (hasReported) {
        return next((0, errorHandler_1.createError)("You have already reported this review", 400));
    }
    review.reportedBy = [...(review.reportedBy || []), user._id];
    review.reportCount += 1;
    await review.save();
    res.status(200).json({
        success: true,
        message: "Review reported successfully",
        data: { isReported: true, reportCount: review.reportCount },
    });
});
const updateProductRating = async (productId) => {
    try {
        const result = await Review_1.Review.aggregate([
            { $match: { productId: productId, status: "APPROVED" } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        const stats = result[0];
        if (stats) {
            await Product_1.Product.findByIdAndUpdate(productId, {
                rating: Math.round(stats.averageRating * 10) / 10,
                reviewCount: stats.totalReviews,
            });
        }
        else {
            await Product_1.Product.findByIdAndUpdate(productId, {
                rating: 0,
                reviewCount: 0,
            });
        }
    }
    catch (error) {
        console.error("Error updating product rating:", error);
    }
};
//# sourceMappingURL=ReviewController.js.map