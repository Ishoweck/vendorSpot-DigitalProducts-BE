"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWithdrawals = exports.initializeWithdrawal = void 0;
const Withdrawal_1 = require("../models/Withdrawal");
const errorHandler_1 = require("../middleware/errorHandler");
const generateWithdrawalReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WD-${random}-${timestamp.slice(-8)}`;
};
exports.initializeWithdrawal = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { amount, bankAccount, bankName, gateway } = req.body;
    if (!amount || !bankAccount || !bankName || !gateway) {
        return next((0, errorHandler_1.createError)("Missing required fields", 400));
    }
    const reference = generateWithdrawalReference();
    const withdrawal = await Withdrawal_1.Withdrawal.create({
        userId: user._id,
        reference,
        amount,
        currency: "NGN",
        gateway,
        withdrawalDetails: { bankAccount, bankName },
        status: "PENDING",
    });
    res.status(201).json({
        success: true,
        message: "Withdrawal initialized",
        data: withdrawal,
    });
});
exports.getUserWithdrawals = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const withdrawals = await Withdrawal_1.Withdrawal.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Withdrawal_1.Withdrawal.countDocuments({ userId: user._id });
    res.status(200).json({
        success: true,
        data: withdrawals,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
//# sourceMappingURL=WithdrawalController.js.map