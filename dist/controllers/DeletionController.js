"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitDeletionForUser = exports.handleDeletionRequest = exports.getAllDeletionRequests = exports.requestAccountDeletion = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const DeletionRequest_1 = require("../models/DeletionRequest");
const User_1 = require("../models/User");
const Vendor_1 = require("../models/Vendor");
const Wallet_1 = require("../models/Wallet");
const Review_1 = require("../models/Review");
const Product_1 = require("../models/Product");
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
exports.requestAccountDeletion = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const existing = await DeletionRequest_1.DeletionRequest.findOne({
        requestedBy: user._id,
        status: "PENDING",
    });
    if (existing) {
        return next((0, errorHandler_1.createError)("A deletion request is already pending", 400));
    }
    let accountType = user.role === "VENDOR" ? "Vendor" : "User";
    const request = await DeletionRequest_1.DeletionRequest.create({
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
exports.getAllDeletionRequests = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    if (user.role !== "SUPERADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    const requests = await DeletionRequest_1.DeletionRequest.find()
        .populate("requestedBy", "email role")
        .populate("decidedBy", "email")
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: requests,
    });
});
exports.handleDeletionRequest = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { requestId } = req.params;
    const { action, decisionReason } = req.body;
    const admin = req.user;
    if (admin.role !== "SUPERADMIN") {
        return next((0, errorHandler_1.createError)("Only SUPERADMIN can manage deletion requests", 403));
    }
    const request = await DeletionRequest_1.DeletionRequest.findById(requestId);
    if (!request)
        return next((0, errorHandler_1.createError)("Deletion request not found", 404));
    if (request.status !== "PENDING") {
        return next((0, errorHandler_1.createError)("This request has already been handled", 400));
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
        const { accountType, accountId } = request;
        if (accountType === "User") {
            await User_1.User.findByIdAndDelete(accountId);
            await Wallet_1.Wallet.deleteOne({ userId: accountId });
            await Order_1.Order.deleteMany({ userId: accountId });
            await Review_1.Review.deleteMany({ userId: accountId });
            await Payment_1.Payment.deleteMany({ userId: accountId });
        }
        if (accountType === "Vendor") {
            const vendor = await Vendor_1.Vendor.findById(accountId);
            if (vendor) {
                await Vendor_1.Vendor.findByIdAndDelete(accountId);
                await Wallet_1.Wallet.deleteOne({ userId: vendor.userId });
                await Product_1.Product.deleteMany({ vendorId: accountId });
                await Order_1.Order.deleteMany({ "items.vendorId": accountId });
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
    return next((0, errorHandler_1.createError)("Invalid action", 400));
});
exports.submitDeletionForUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const admin = req.user;
    if (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    const { accountId, accountType, reason } = req.body;
    if (!["User", "Vendor"].includes(accountType)) {
        return next((0, errorHandler_1.createError)("Invalid accountType", 400));
    }
    const existing = await DeletionRequest_1.DeletionRequest.findOne({
        accountId,
        status: "PENDING",
    });
    if (existing) {
        return next((0, errorHandler_1.createError)("A pending deletion request already exists for this account", 400));
    }
    const deletionRequest = await DeletionRequest_1.DeletionRequest.create({
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
//# sourceMappingURL=DeletionController.js.map