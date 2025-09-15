"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPayment = exports.getUserPayments = exports.verifyPayment = exports.initializePayment = void 0;
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const SocketService_1 = require("../services/SocketService");
const config_1 = __importDefault(require("../config/config"));
const NotificationController_1 = require("./NotificationController");
const generatePaymentReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${random}-${timestamp.slice(-8)}`;
};
exports.initializePayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { orderId, idempotencyKey } = req.body;
    if (!orderId || !idempotencyKey) {
        return next((0, errorHandler_1.createError)("Order ID and idempotency key are required", 400));
    }
    const existingPayment = await Payment_1.Payment.findOne({ idempotencyKey });
    if (existingPayment) {
        return res.status(200).json({
            success: true,
            message: "Payment already exists",
            data: existingPayment,
        });
    }
    const order = await Order_1.Order.findOne({
        _id: orderId,
        userId: user._id,
    });
    if (!order) {
        return next((0, errorHandler_1.createError)("Order not found", 404));
    }
    if (order.paymentStatus === "PAID") {
        return next((0, errorHandler_1.createError)("Order already paid", 400));
    }
    const reference = generatePaymentReference();
    const paymentData = {
        email: user.email,
        amount: Math.round(order.total * 100),
        reference,
        currency: order.currency,
        callback_url: "https://digitalproducts.vendorspotng.com/checkout/confirmation",
        metadata: {
            orderId: order._id,
            userId: user._id,
            orderNumber: order.orderNumber,
        },
    };
    try {
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config_1.default.paystackSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
        });
        const data = (await response.json());
        if (!data.status) {
            return next((0, errorHandler_1.createError)("Failed to initialize payment", 400));
        }
        const payment = await Payment_1.Payment.create({
            orderId: order._id,
            userId: user._id,
            reference,
            gateway: "PAYSTACK",
            amount: order.total,
            currency: order.currency,
            callback_url: "https://digitalproducts.vendorspotng.com/checkout/confirmation",
            metadata: paymentData.metadata,
            idempotencyKey,
        });
        res.status(200).json({
            success: true,
            message: "Payment initialized successfully",
            data: {
                payment,
                authorization_url: data.data.authorization_url,
                access_code: data.data.access_code,
                reference: data.data.reference,
            },
        });
    }
    catch (error) {
        console.error("Paystack initialization error:", error);
        return next((0, errorHandler_1.createError)("Payment initialization failed", 500));
    }
});
exports.verifyPayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { reference } = req.params;
    const payment = await Payment_1.Payment.findOne({ reference }).populate("orderId");
    if (!payment) {
        return next((0, errorHandler_1.createError)("Payment not found", 404));
    }
    if (payment.status === "SUCCESS") {
        return res.status(200).json({
            success: true,
            message: "Payment already verified",
            data: payment,
        });
    }
    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${config_1.default.paystackSecretKey}`,
                "Content-Type": "application/json",
            },
        });
        const data = (await response.json());
        if (!data.status) {
            payment.status = "FAILED";
            payment.failureReason = data.message;
            await payment.save();
            return next((0, errorHandler_1.createError)("Payment verification failed", 400));
        }
        const transactionData = data.data;
        if (transactionData.status === "success") {
            payment.status = "SUCCESS";
            payment.paidAt = new Date();
            payment.gatewayResponse = transactionData;
            payment.channel = transactionData.channel;
            await payment.save();
            const order = await Order_1.Order.findById(payment.orderId);
            if (order) {
                order.paymentStatus = "PAID";
                order.status = "DELIVERED";
                order.paymentReference = reference;
                order.deliveredAt = new Date();
                await order.save();
                for (const item of order.items) {
                    await Product_1.Product.findByIdAndUpdate(item.productId, {
                        $inc: { soldCount: item.quantity },
                    });
                }
                await User_1.User.findByIdAndUpdate(payment.userId, {
                    cart: { items: [] },
                });
                try {
                    const io = SocketService_1.SocketService.getIO();
                    io.to(payment.userId.toString()).emit("payment:success", {
                        orderId: order._id,
                        reference,
                        amount: payment.amount,
                    });
                    for (const item of order.items) {
                        io.to(item.vendorId.toString()).emit("order:payment_received", {
                            orderId: order._id,
                            orderNumber: order.orderNumber,
                            amount: item.price * item.quantity,
                        });
                    }
                }
                catch (error) {
                    console.log("Socket emit error:", error);
                }
            }
            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: payment,
            });
        }
        else {
            payment.status = "FAILED";
            payment.failureReason = transactionData.gateway_response;
            await payment.save();
            res.status(400).json({
                success: false,
                message: "Payment failed",
                data: payment,
            });
        }
    }
    catch (error) {
        console.error("Payment verification error:", error);
        return next((0, errorHandler_1.createError)("Payment verification failed", 500));
    }
});
exports.getUserPayments = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const payments = await Payment_1.Payment.find({ userId: user._id })
        .populate({
        path: "orderId",
        select: "orderNumber total items",
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Payment_1.Payment.countDocuments({ userId: user._id });
    res.status(200).json({
        success: true,
        data: payments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.refundPayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { amount, reason } = req.body;
    if (user.role !== "ADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    const payment = await Payment_1.Payment.findById(req.params.id).populate("orderId");
    if (!payment) {
        return next((0, errorHandler_1.createError)("Payment not found", 404));
    }
    if (payment.status !== "SUCCESS") {
        return next((0, errorHandler_1.createError)("Payment cannot be refunded", 400));
    }
    const refundAmount = amount || payment.amount;
    const refundReference = `REF-${Date.now()}`;
    try {
        const response = await fetch("https://api.paystack.co/refund", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config_1.default.paystackSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transaction: payment.reference,
                amount: Math.round(refundAmount * 100),
                currency: payment.currency,
                customer_note: reason,
                merchant_note: `Refund for order ${payment.orderId.orderNumber}`,
            }),
        });
        const data = (await response.json());
        if (!data.status) {
            return next((0, errorHandler_1.createError)("Refund failed", 400));
        }
        payment.status = "REFUNDED";
        payment.refundAmount = refundAmount;
        payment.refundedAt = new Date();
        payment.refundReference = refundReference;
        await payment.save();
        const order = await Order_1.Order.findById(payment.orderId);
        if (order) {
            order.paymentStatus = "REFUNDED";
            order.refundAmount = refundAmount;
            order.refundReason = reason;
            await order.save();
        }
        try {
            const io = SocketService_1.SocketService.getIO();
            io.to(payment.userId.toString()).emit("payment:refunded", {
                orderId: payment.orderId,
                reference: payment.reference,
                amount: refundAmount,
            });
        }
        catch (error) {
            console.log("Socket emit error:", error);
        }
        try {
            await (0, NotificationController_1.createNotification)({
                userId: payment.userId.toString(),
                type: "PAYMENT_REFUNDED",
                title: "Payment Refunded",
                message: `Your payment of ₦${refundAmount.toLocaleString()} has been refunded. Reason: ${reason}`,
                category: "PAYMENT",
                priority: "HIGH",
                channels: ["IN_APP", "EMAIL"],
                data: {
                    orderId: payment.orderId,
                    reference: payment.reference,
                    amount: refundAmount,
                    reason: reason,
                },
            });
        }
        catch (error) {
            console.error("Failed to create payment refund notification:", error);
        }
        res.status(200).json({
            success: true,
            message: "Payment refunded successfully",
            data: payment,
        });
    }
    catch (error) {
        console.error("Refund error:", error);
        return next((0, errorHandler_1.createError)("Refund failed", 500));
    }
});
//# sourceMappingURL=PaymentController.js.map