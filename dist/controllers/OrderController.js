"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.getVendorOrders = exports.getOrderByPaymentReference = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const Order_1 = require("@/models/Order");
const Product_1 = require("@/models/Product");
const Vendor_1 = require("@/models/Vendor");
const Payment_1 = require("@/models/Payment");
const errorHandler_1 = require("@/middleware/errorHandler");
const SocketService_1 = require("@/services/SocketService");
const NotificationController_1 = require("./NotificationController");
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${random}-${timestamp.slice(-8)}`;
};
exports.createOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { items, shippingAddress, shippingMethod, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return next((0, errorHandler_1.createError)("Order items are required", 400));
    }
    const productIds = items.map((item) => item.productId);
    const products = await Product_1.Product.find({
        _id: { $in: productIds },
        isActive: true,
        isApproved: true,
    }).populate("vendorId");
    if (products.length !== items.length) {
        return next((0, errorHandler_1.createError)("Some products are not available", 400));
    }
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
        const product = products.find((p) => p._id.toString() === item.productId);
        if (!product) {
            return next((0, errorHandler_1.createError)(`Product ${item.productId} not found`, 400));
        }
        const quantity = item.quantity || 1;
        const itemTotal = product.price * quantity;
        orderItems.push({
            productId: product._id,
            vendorId: product.vendorId,
            name: product.name,
            price: product.price,
            quantity,
            downloadLimit: product.downloadLimit || -1,
            downloadCount: 0,
        });
        subtotal += itemTotal;
    }
    const tax = subtotal * 0.075;
    const shippingFee = shippingMethod === "EXPRESS"
        ? 2500
        : shippingMethod === "SAME_DAY"
            ? 5000
            : 0;
    const total = subtotal + tax + shippingFee;
    const orderNumber = generateOrderNumber();
    const order = await Order_1.Order.create({
        orderNumber,
        userId: user._id,
        items: orderItems,
        subtotal,
        tax,
        shippingFee,
        total,
        shippingAddress,
        shippingMethod,
        paymentMethod,
    });
    try {
        const io = SocketService_1.SocketService.getIO();
        io.to(user._id.toString()).emit("order:created", {
            orderId: order._id,
            orderNumber: order.orderNumber,
            total: order.total,
        });
        for (const item of orderItems) {
            io.to(item.vendorId.toString()).emit("order:new", {
                orderId: order._id,
                orderNumber: order.orderNumber,
                productName: item.name,
            });
        }
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: String(user._id),
            type: "ORDER_CREATED",
            title: "Order Placed Successfully",
            message: `Your order #${order.orderNumber} has been placed successfully. Total: ₦${order.total.toLocaleString()}`,
            category: "ORDER",
            priority: "NORMAL",
            channels: ["IN_APP"],
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
            },
        });
    }
    catch (error) {
        console.error("Failed to create order notification:", error);
    }
    for (const item of orderItems) {
        try {
            await (0, NotificationController_1.createNotification)({
                userId: item.vendorId.toString(),
                type: "ORDER_CREATED",
                title: "New Order Received",
                message: `New order #${order.orderNumber} for "${item.name}" has been placed`,
                category: "ORDER",
                priority: "HIGH",
                channels: ["IN_APP", "EMAIL"],
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                },
            });
        }
        catch (error) {
            console.error("Failed to create vendor order notification:", error);
        }
    }
    res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
    });
});
exports.getUserOrders = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = { userId: user._id };
    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus;
    }
    const orders = await Order_1.Order.find(query)
        .populate({
        path: "items.productId",
        select: "name thumbnail",
    })
        .populate({
        path: "items.vendorId",
        select: "businessName",
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Order_1.Order.countDocuments(query);
    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.getOrderById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const order = await Order_1.Order.findOne({
        _id: req.params.id,
        userId: user._id,
    })
        .populate({
        path: "items.productId",
        select: "name thumbnail",
    })
        .populate({
        path: "items.vendorId",
        select: "businessName",
    });
    if (!order) {
        return next((0, errorHandler_1.createError)("Order not found", 404));
    }
    res.status(200).json({
        success: true,
        data: order,
    });
});
exports.getOrderByPaymentReference = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { reference } = req.params;
    const order = await Order_1.Order.findOne({
        paymentReference: reference,
    })
        .populate({
        path: "items.productId",
        select: "name thumbnail description",
    })
        .populate({
        path: "items.vendorId",
        select: "businessName",
    });
    if (!order) {
        return next((0, errorHandler_1.createError)("Order not found", 404));
    }
    res.status(200).json({
        success: true,
        data: order,
    });
});
exports.getVendorOrders = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const orders = await Order_1.Order.find({
        "items.vendorId": vendor._id,
    })
        .populate({
        path: "userId",
        select: "firstName lastName email",
    })
        .populate({
        path: "items.productId",
        select: "name thumbnail",
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Order_1.Order.countDocuments({
        "items.vendorId": vendor._id,
    });
    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.updateOrderStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { status, trackingNumber, notes } = req.body;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor && user.role !== "ADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    const order = await Order_1.Order.findById(req.params.id);
    if (!order) {
        return next((0, errorHandler_1.createError)("Order not found", 404));
    }
    if (vendor &&
        !order.items.some((item) => item.vendorId.toString() === vendor._id.toString())) {
        return next((0, errorHandler_1.createError)("Unauthorized to update this order", 403));
    }
    const validStatuses = [
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid status", 400));
    }
    order.status = status;
    if (trackingNumber)
        order.trackingNumber = trackingNumber;
    if (notes)
        order.notes = notes;
    if (status === "DELIVERED") {
        order.deliveredAt = new Date();
    }
    if (status === "CANCELLED") {
        order.cancelledAt = new Date();
        if (req.body.cancellationReason) {
            order.cancellationReason = req.body.cancellationReason;
        }
    }
    await order.save();
    try {
        await (0, NotificationController_1.createNotification)({
            userId: order.userId.toString(),
            type: status === "DELIVERED" ? "ORDER_DELIVERED" : "ORDER_CONFIRMED",
            title: status === "DELIVERED" ? "Order Delivered" : "Order Confirmed",
            message: `Your order #${order.orderNumber} has been ${status.toLowerCase()}.`,
            category: "ORDER",
            priority: "NORMAL",
            channels: ["IN_APP", "EMAIL"],
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                trackingNumber: order.trackingNumber,
            },
        });
    }
    catch (error) {
        console.error("Failed to create order status notification:", error);
    }
    try {
        const io = SocketService_1.SocketService.getIO();
        io.to(order.userId.toString()).emit("order:status_updated", {
            orderId: order._id,
            status: order.status,
            trackingNumber: order.trackingNumber,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
    });
});
exports.cancelOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { reason } = req.body;
    const order = await Order_1.Order.findOne({
        _id: req.params.id,
        userId: user._id,
    });
    if (!order) {
        return next((0, errorHandler_1.createError)("Order not found", 404));
    }
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        return next((0, errorHandler_1.createError)("Order cannot be cancelled at this stage", 400));
    }
    order.status = "CANCELLED";
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save();
    if (order.paymentStatus === "PAID") {
        const payment = await Payment_1.Payment.findOne({ orderId: order._id });
        if (payment) {
            payment.status = "REFUNDED";
            payment.refundAmount = order.total;
            payment.refundedAt = new Date();
            await payment.save();
            order.paymentStatus = "REFUNDED";
            order.refundAmount = order.total;
            await order.save();
        }
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: order.userId.toString(),
            type: "ORDER_CANCELLED",
            title: "Order Cancelled",
            message: `Your order #${order.orderNumber} has been cancelled. Reason: ${reason}`,
            category: "ORDER",
            priority: "HIGH",
            channels: ["IN_APP", "EMAIL"],
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                reason: reason,
            },
        });
    }
    catch (error) {
        console.error("Failed to create order cancellation notification:", error);
    }
    try {
        const io = SocketService_1.SocketService.getIO();
        for (const item of order.items) {
            io.to(item.vendorId.toString()).emit("order:cancelled", {
                orderId: order._id,
                orderNumber: order.orderNumber,
                reason,
            });
        }
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
    });
});
//# sourceMappingURL=OrderController.js.map