"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWithdrawal = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Withdrawal_1 = require("../models/Withdrawal");
const User_1 = require("../models/User");
const Wallet_1 = require("../models/Wallet");
const NotificationController_1 = require("./NotificationController");
const generateWithdrawalReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WITDR-${random}-${timestamp.slice(-8)}`;
};
exports.initializeWithdrawal = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { amount, bankAccount, bankName, gateway, accountName } = req.body;
    if (!amount || !bankAccount || !bankName || !gateway || !accountName) {
        return next((0, errorHandler_1.createError)("Missing required fields", 400));
    }
    const userDoc = await User_1.User.findById(user._id);
    if (!userDoc) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    const wallet = await Wallet_1.Wallet.findOne({ userId: user._id });
    if (!wallet) {
        return next((0, errorHandler_1.createError)("User wallet not found", 404));
    }
    if (wallet.availableBalance < amount) {
        return next((0, errorHandler_1.createError)("Insufficient wallet balance", 400));
    }
    wallet.availableBalance -= amount;
    const reference = generateWithdrawalReference();
    const withdrawal = await Withdrawal_1.Withdrawal.create({
        userId: user._id,
        reference,
        amount,
        currency: "NGN",
        gateway,
        withdrawalDetails: { bankAccount, bankName, accountName },
        status: "PENDING",
    });
    const walletTransaction = {
        type: "withdrawal",
        title: `Withdrawal Requested (${reference})`,
        description: `Withdrawal of NGN ${amount} via ${gateway}`,
        amount: -amount,
        timestamp: new Date(),
        isPositive: false,
        reference,
        metadata: {
            bankAccount,
            bankName,
            withdrawalId: withdrawal._id,
        },
    };
    wallet.transactions.push(walletTransaction);
    await wallet.save();
    try {
        await (0, NotificationController_1.createNotification)({
            userId: user._id.toString(),
            type: "PAYMENT_PENDING",
            title: "Withdrawal Requested",
            message: `Your withdrawal of NGN ${amount} has been initiated and is pending processing.`,
            category: "PAYMENT",
            priority: "HIGH",
            channels: ["IN_APP"],
            data: {
                withdrawalId: withdrawal._id,
                amount,
                status: "PENDING",
            },
        });
    }
    catch (error) {
        console.error("Failed to create withdrawal notification:", error);
    }
    res.status(201).json({
        success: true,
        message: "Withdrawal initialized",
        data: withdrawal,
    });
});
//# sourceMappingURL=WithdrawalController.js.map