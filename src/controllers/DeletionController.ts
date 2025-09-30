import { Request, Response, NextFunction } from "express";
import { createNotification } from "./NotificationController";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { DeletionRequest } from "../models/DeletionRequest";
import { User } from "../models/User";
import { Vendor } from "../models/Vendor"; 
import { Wallet } from "../models/Wallet"; 
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { Payment } from "../models/Payment";
import { Order, IOrder } from "../models/Order";

export const requestAccountDeletion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any; // Assume auth middleware sets this

  const existing = await DeletionRequest.findOne({
    requestedBy: user._id,
    status: "PENDING",
  });

  if (existing) {
    return next(createError("A deletion request is already pending", 400));
  }

  let accountType: "User" | "Vendor" = user.role === "VENDOR" ? "Vendor" : "User";

  const request = await DeletionRequest.create({
    accountId: user._id,
    accountType,
    requestedBy: user._id,
    reason: req.body.reason,
  });

  res.status(201).json({
    success: true,
    message: "Deletion request submitted successfully",
    data: request,
  });
});


export const getAllDeletionRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (user.role !== "SUPERADMIN") {
    return next(createError("Unauthorized", 403));
  }

  const requests = await DeletionRequest.find()
    .populate("requestedBy", "email role")
    .populate("decidedBy", "email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: requests,
  });
});


export const handleDeletionRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { action, decisionReason } = req.body;
  const admin = req.user as any;

  if (admin.role !== "SUPERADMIN") {
    return next(createError("Only SUPERADMIN can manage deletion requests", 403));
  }

  const request = await DeletionRequest.findById(requestId);
  if (!request) return next(createError("Deletion request not found", 404));

  if (request.status !== "PENDING") {
    return next(createError("This request has already been handled", 400));
  }

  if (action === "REJECT") {
    request.status = "REJECTED";
    request.decisionReason = decisionReason;
    request.decidedBy = admin._id;
    request.decidedAt = new Date();
    await request.save();

    return res.json({ success: true, message: "Deletion request rejected", data: request });
  }

  if (action === "APPROVE") {
    request.status = "APPROVED";
    request.decisionReason = decisionReason;
    request.decidedBy = admin._id;
    request.decidedAt = new Date();

    // Proceed with deletion
    const { accountType, accountId } = request;

    if (accountType === "User") {
      await User.findByIdAndDelete(accountId);
      await Wallet.deleteOne({ userId: accountId });
      await Order.deleteMany({ userId: accountId });
      await Review.deleteMany({ userId: accountId });
      await Payment.deleteMany({ userId: accountId });
    }

    if (accountType === "Vendor") {
      const vendor = await Vendor.findById(accountId);
      if (vendor) {
        await Vendor.findByIdAndDelete(accountId);
        await Wallet.deleteOne({ userId: vendor.userId });
        await Product.deleteMany({ vendorId: accountId });
        await Order.deleteMany({ "items.vendorId": accountId });
      }
    }

    request.status = "DELETED";
    request.deletedAt = new Date();
    await request.save();

    return res.json({
      success: true,
      message: `${accountType} account deleted successfully`,
      data: request,
    });
  }

  return next(createError("Invalid action", 400));
});


export const submitDeletionForUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const admin = req.user as any;

  if (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN") {
    return next(createError("Unauthorized", 403));
  }

  const { accountId, accountType, reason } = req.body;

  // Validate accountType
  if (!["User", "Vendor"].includes(accountType)) {
    return next(createError("Invalid accountType", 400));
  }

  const existing = await DeletionRequest.findOne({
    accountId,
    status: "PENDING",
  });

  if (existing) {
    return next(createError("A pending deletion request already exists for this account", 400));
  }

  const deletionRequest = await DeletionRequest.create({
    accountId,
    accountType,
    requestedBy: admin._id,
    submittedByAdmin: true,
    reason,
  });

  res.status(201).json({
    success: true,
    message: "Deletion request submitted successfully by admin",
    data: deletionRequest,
  });
});
