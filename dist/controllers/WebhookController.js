"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const SocketService_1 = require("../services/SocketService");
const NotificationController_1 = require("./NotificationController");
const config_1 = __importDefault(require("../config/config"));
exports.paystackWebhook = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const hash = crypto_1.default
        .createHmac("sha512", config_1.default.paystackSecretKey)
        .update(JSON.stringify(req.body))
        .digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(400).json({
            success: false,
            message: "Invalid signature",
        });
    }
    const event = req.body;
    switch (event.event) {
        case "charge.success":
            await handleSuccessfulPayment(event.data);
            break;
        case "charge.failed":
            await handleFailedPayment(event.data);
            break;
        case "transfer.success":
            await handleSuccessfulTransfer(event.data);
            break;
        case "transfer.failed":
            await handleFailedTransfer(event.data);
            break;
        case "refund.processed":
            await handleRefundProcessed(event.data);
            break;
        default:
            console.log(`Unhandled webhook event: ${event.event}`);
            return res.status(400).json({
                success: false,
                message: `Unhandled webhook event: ${event.event}`,
            });
    }
    return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
    });
});
const handleSuccessfulPayment = async (data) => {
    try {
        const payment = await Payment_1.Payment.findOne({ reference: data.reference });
        if (!payment) {
            console.log(`Payment not found for reference: ${data.reference}`);
            return;
        }
        if (payment.status === "SUCCESS") {
            console.log(`Payment already processed: ${data.reference}`);
            return;
        }
        payment.status = "SUCCESS";
        payment.paidAt = new Date();
        payment.gatewayResponse = data;
        payment.channel = data.channel;
        await payment.save();
        const order = await Order_1.Order.findById(payment.orderId);
        if (order) {
            order.paymentStatus = "PAID";
            order.status = "DELIVERED";
            order.paymentReference = data.reference;
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
            await (0, NotificationController_1.createNotification)({
                userId: payment.userId.toString(),
                type: "PAYMENT_SUCCESS",
                title: "Payment Successful",
                message: `Your payment of ₦${payment.amount.toLocaleString()} for order ${order.orderNumber} was successful.`,
                category: "PAYMENT",
                priority: "HIGH",
                channels: ["IN_APP", "EMAIL"],
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    amount: payment.amount,
                },
            });
            for (const item of order.items) {
                await (0, NotificationController_1.createNotification)({
                    userId: item.vendorId.toString(),
                    type: "ORDER_PAYMENT_RECEIVED",
                    title: "New Order Payment Received",
                    message: `Payment received for order ${order.orderNumber} - ${item.name}`,
                    category: "ORDER",
                    priority: "NORMAL",
                    channels: ["IN_APP", "EMAIL"],
                    data: {
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        productName: item.name,
                        amount: item.price * item.quantity,
                    },
                });
            }
            try {
                const io = SocketService_1.SocketService.getIO();
                io.to(payment.userId.toString()).emit("payment:success", {
                    orderId: order._id,
                    reference: data.reference,
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
        console.log(`Payment successful: ${data.reference}`);
    }
    catch (error) {
        console.error("Error handling successful payment:", error);
    }
};
const handleFailedPayment = async (data) => {
    try {
        const payment = await Payment_1.Payment.findOne({ reference: data.reference });
        if (!payment) {
            console.log(`Payment not found for reference: ${data.reference}`);
            return;
        }
        payment.status = "FAILED";
        payment.failureReason = data.gateway_response;
        payment.gatewayResponse = data;
        await payment.save();
        try {
            await (0, NotificationController_1.createNotification)({
                userId: payment.userId.toString(),
                type: "PAYMENT_FAILED",
                title: "Payment Failed",
                message: `Your payment of ₦${payment.amount.toLocaleString()} failed. Reason: ${data.gateway_response}`,
                category: "PAYMENT",
                priority: "HIGH",
                channels: ["IN_APP", "EMAIL"],
                data: {
                    orderId: payment.orderId,
                    reference: data.reference,
                    amount: payment.amount,
                    failureReason: data.gateway_response,
                },
            });
        }
        catch (error) {
            console.error("Failed to create payment failure notification:", error);
        }
        try {
            const io = SocketService_1.SocketService.getIO();
            io.to(payment.userId.toString()).emit("payment:failed", {
                orderId: payment.orderId,
                reference: data.reference,
                reason: data.gateway_response,
            });
        }
        catch (error) {
            console.log("Socket emit error:", error);
        }
        console.log(`Payment failed: ${data.reference}`);
    }
    catch (error) {
        console.error("Error handling failed payment:", error);
    }
};
const handleSuccessfulTransfer = async (data) => {
    try {
        console.log(`Transfer successful: ${data.reference}`, data);
    }
    catch (error) {
        console.error("Error handling successful transfer:", error);
    }
};
const handleFailedTransfer = async (data) => {
    try {
        console.log(`Transfer failed: ${data.reference}`, data);
    }
    catch (error) {
        console.error("Error handling failed transfer:", error);
    }
};
const handleRefundProcessed = async (data) => {
    try {
        const payment = await Payment_1.Payment.findOne({
            $or: [
                { reference: data.transaction_reference },
                { refundReference: data.reference },
            ],
        });
        if (!payment) {
            console.log(`Payment not found for refund: ${data.reference}`);
            return;
        }
        if (payment.status !== "REFUNDED") {
            payment.status = "REFUNDED";
            payment.refundAmount = data.amount / 100;
            payment.refundedAt = new Date();
            payment.refundReference = data.reference;
            await payment.save();
            const order = await Order_1.Order.findById(payment.orderId);
            if (order) {
                order.paymentStatus = "REFUNDED";
                order.refundAmount = data.amount / 100;
                await order.save();
            }
            try {
                const io = SocketService_1.SocketService.getIO();
                io.to(payment.userId.toString()).emit("payment:refunded", {
                    orderId: payment.orderId,
                    reference: payment.reference,
                    amount: data.amount / 100,
                });
            }
            catch (error) {
                console.log("Socket emit error:", error);
            }
        }
        console.log(`Refund processed: ${data.reference}`);
    }
    catch (error) {
        console.error("Error handling refund processed:", error);
    }
};
//# sourceMappingURL=WebhookController.js.map