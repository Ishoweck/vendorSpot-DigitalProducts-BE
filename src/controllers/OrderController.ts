import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Vendor } from "../models/Vendor";
import { Payment } from "../models/Payment";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { SocketService } from "../services/SocketService";
import { createNotification } from "./NotificationController";
import { Wallet , WalletTransactionType} from "../models/Wallet";  // Path to your Wallet model
import { IVendor } from "../models/Vendor";  // Correct import for IVendor

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${random}-${timestamp.slice(-8)}`;
};




export const createOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { items, shippingAddress, shippingMethod, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(createError("Order items are required", 400));
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      isApproved: true,
    }).populate("vendorId");

    if (products.length !== items.length) {
      return next(createError("Some products are not available", 400));
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find(
        (p) => (p as any)._id.toString() === item.productId
      );
      if (!product) {
        return next(createError(`Product ${item.productId} not found`, 400));
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
    const shippingFee =
      shippingMethod === "EXPRESS"
        ? 2500
        : shippingMethod === "SAME_DAY"
        ? 5000
        : 0;
    const total = subtotal + tax + shippingFee;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
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
      const io = SocketService.getIO();
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
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    // Process vendor's earnings and wallet update
    for (const item of orderItems) {
      // Find the vendor by vendorId
      const vendor = await Vendor.findById(item.vendorId);

      if (vendor && vendor.walletId) {
        // Now, find the wallet by walletId
        const wallet = await Wallet.findById(vendor.walletId);

        if (wallet) {
          const earnings = item.price * item.quantity;

          // Update wallet fields
          wallet.totalEarnings += earnings;
          wallet.thisMonth += earnings;
          wallet.availableBalance += earnings

          // Create a wallet transaction
          const walletTransaction = {
            type: "payment_received", // Type of transaction
            title: `Order #${order.orderNumber} Payment`,
            description: `Payment for ${item.name}`,
            amount: earnings,
            timestamp: new Date(),
            isPositive: true,
          };

          wallet.transactions.push(walletTransaction);

          // Save the updated wallet document
          await wallet.save();  // Save the wallet with updated values
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  }
);



export const getUserOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId: user._id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    const orders = await Order.find(query)
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

    const total = await Order.countDocuments(query);

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
  }
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const order = await Order.findOne({
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
      return next(createError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

export const getOrderByPaymentReference = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reference } = req.params;

    const order = await Order.findOne({
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
      return next(createError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

export const getVendorOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const vendor = await Vendor.findOne({ userId: user._id });

    if (!vendor) {
      return next(createError("Vendor not found", 404));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
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

    const total = await Order.countDocuments({
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
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { status, trackingNumber, notes } = req.body;

    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor && user.role !== "ADMIN") {
      return next(createError("Unauthorized", 403));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError("Order not found", 404));
    }

    if (
      vendor &&
      !order.items.some(
        (item) => item.vendorId.toString() === (vendor._id as string).toString()
      )
    ) {
      return next(createError("Unauthorized to update this order", 403));
    }

    const validStatuses = [
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return next(createError("Invalid status", 400));
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

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
      await createNotification({
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
    } catch (error) {
      console.error("Failed to create order status notification:", error);
    }

    try {
      const io = SocketService.getIO();
      io.to(order.userId.toString()).emit("order:status_updated", {
        orderId: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
      });
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  }
);

export const cancelOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!order) {
      return next(createError("Order not found", 404));
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return next(createError("Order cannot be cancelled at this stage", 400));
    }

    order.status = "CANCELLED";
    order.cancelledAt = new Date();
    order.cancellationReason = reason;

    await order.save();

    if (order.paymentStatus === "PAID") {
      const payment = await Payment.findOne({ orderId: order._id });
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
      await createNotification({
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
    } catch (error) {
      console.error("Failed to create order cancellation notification:", error);
    }

    try {
      const io = SocketService.getIO();

      for (const item of order.items) {
        io.to(item.vendorId.toString()).emit("order:cancelled", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          reason,
        });
      }
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  }
);
