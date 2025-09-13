import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Vendor } from "@/models/Vendor";
import { cloudinaryService } from "@/services/cloudinaryService";
import { asyncHandler, createError } from "@/middleware/errorHandler";
import { SocketService } from "@/services/SocketService";
import { createNotification } from "./NotificationController";

export const createReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { productId, orderId, rating, title, comment } = req.body;

    if (!productId || !orderId || !rating) {
      return next(
        createError("Product ID, Order ID, and rating are required", 400)
      );
    }

    if (rating < 1 || rating > 5) {
      return next(createError("Rating must be between 1 and 5", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError("Product not found", 404));
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: user._id,
      status: "DELIVERED",
      "items.productId": productId,
    });

    if (!order) {
      return next(createError("Order not found or not delivered", 404));
    }

    const existingReview = await Review.findOne({
      userId: user._id,
      productId,
    });

    if (existingReview) {
      return next(createError("You have already reviewed this product", 400));
    }

    const images: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const imageUpload = await cloudinaryService.uploadFile(
          file,
          "reviews/images"
        );
        images.push(imageUpload.url);
      }
    }

    const review = await Review.create({
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
      const io = SocketService.getIO();
      io.to(product.vendorId.toString()).emit("review:created", {
        reviewId: review._id,
        productId,
        rating,
        userName: `${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    try {
      await createNotification({
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
    } catch (error) {
      console.error("Failed to create review notification:", error);
    }

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  }
);

export const getProductReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const query: any = {
      productId: productObjectId,
      status: "APPROVED",
    };

    if (req.query.rating) {
      query.rating = parseInt(req.query.rating as string);
    }

    const reviews = await Review.find(query)
      .populate("userId", "firstName lastName avatar")
      .populate("response.respondedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    const ratingDistribution = await Review.aggregate([
      { $match: { productId: productObjectId, status: "APPROVED" } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const avgRating = await Review.aggregate([
      { $match: { productId: productObjectId, status: "APPROVED" } },
      { $group: { _id: null, average: { $avg: "$rating" } } },
    ]);

    const currentUserId = (req.user as any)?._id?.toString();
    const reviewsWithHelpful = reviews.map((r: any) => ({
      ...r.toObject(),
      isHelpful: currentUserId
        ? (r.helpfulBy || []).some((id: any) => id.toString() === currentUserId)
        : false,
      isReported: currentUserId
        ? (r.reportedBy || []).some(
            (id: any) => id.toString() === currentUserId
          )
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
  }
);

export const getUserReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId: user._id })
      .populate("productId", "name thumbnail")
      .populate("vendorId", "businessName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId: user._id });

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
  }
);

export const updateReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!review) {
      return next(createError("Review not found", 404));
    }

    if (rating && (rating < 1 || rating > 5)) {
      return next(createError("Rating must be between 1 and 5", 400));
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    review.status = "PENDING";
    await review.save();

    await updateProductRating(review.productId.toString());

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  }
);

export const deleteReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const review = await Review.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!review) {
      return next(createError("Review not found", 404));
    }

    if (review.images && review.images.length > 0) {
      for (const imageUrl of review.images) {
        cloudinaryService.deleteFile(imageUrl).catch(console.error);
      }
    }

    await Review.findByIdAndDelete(req.params.id);
    await updateProductRating(review.productId.toString());

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  }
);

export const respondToReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { message } = req.body;

    if (!message) {
      return next(createError("Response message is required", 400));
    }

    const review = await Review.findById(req.params.id).populate({
      path: "productId",
      select: "vendorId",
    });
    if (!review) {
      return next(createError("Review not found", 404));
    }

    const vendor = (await Vendor.findOne({ userId: user._id })) as any;
    if (!vendor) {
      return next(createError("Only vendors can respond to reviews", 403));
    }

    if (
      vendor._id.toString() !== (review.productId as any).vendorId.toString()
    ) {
      return next(createError("Unauthorized to respond to this review", 403));
    }

    review.response = {
      message,
      respondedAt: new Date(),
      respondedBy: user._id,
    };

    await review.save();

    try {
      const io = SocketService.getIO();
      io.to(review.userId.toString()).emit("review:response", {
        reviewId: review._id,
        vendorName: vendor.businessName,
        message,
      });
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    try {
      await createNotification({
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
    } catch (error) {
      console.error("Failed to create review response notification:", error);
    }

    res.status(200).json({
      success: true,
      message: "Response added successfully",
      data: review,
    });
  }
);

export const markReviewHelpful = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(createError("Review not found", 404));
    }

    const userIdStr = user._id.toString();
    const hasVoted = (review.helpfulBy || []).some(
      (id: any) => id.toString() === userIdStr
    );

    if (hasVoted) {
      review.helpfulBy = (review.helpfulBy || []).filter(
        (id: any) => id.toString() !== userIdStr
      ) as any;
      review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
    } else {
      review.helpfulBy = [...(review.helpfulBy || []), user._id] as any;
      review.helpfulCount = (review.helpfulCount || 0) + 1;
      try {
        await createNotification({
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
      } catch (err) {
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
  }
);

export const reportReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(createError("Review not found", 404));
    }

    const userIdStr = user._id.toString();
    const hasReported = (review.reportedBy || []).some(
      (id: any) => id.toString() === userIdStr
    );

    if (hasReported) {
      return next(createError("You have already reported this review", 400));
    }

    review.reportedBy = [...(review.reportedBy || []), user._id] as any;
    review.reportCount += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review reported successfully",
      data: { isReported: true, reportCount: review.reportCount },
    });
  }
);

const updateProductRating = async (productId: string) => {
  try {
    const result = await Review.aggregate([
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
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats.averageRating * 10) / 10,
        reviewCount: stats.totalReviews,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};
