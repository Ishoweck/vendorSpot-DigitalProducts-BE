import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { SocketService } from "../services/SocketService";
import config from "../config/config";
import { createNotification } from "./NotificationController";

const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${random}-${timestamp.slice(-8)}`;
};

export const initializePayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { orderId, idempotencyKey } = req.body;

    if (!orderId || !idempotencyKey) {
      return next(
        createError("Order ID and idempotency key are required", 400)
      );
    }

    const existingPayment = await Payment.findOne({ idempotencyKey });
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment already exists",
        data: existingPayment,
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: user._id,
    });

    if (!order) {
      return next(createError("Order not found", 404));
    }

    if (order.paymentStatus === "PAID") {
      return next(createError("Order already paid", 400));
    }

    const reference = generatePaymentReference();

    order.paymentReference = reference;

    await order.save();

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
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.paystackSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const data = (await response.json()) as {
        status: boolean;
        data?: any;
        message?: string;
      };

      if (!data.status) {
        return next(createError("Failed to initialize payment", 400));
      }

      const payment = await Payment.create({
        orderId: order._id,
        userId: user._id,
        reference,
        gateway: "PAYSTACK",
        amount: order.total,
        currency: order.currency,
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
    } catch (error) {
      console.error("Paystack initialization error:", error);
      return next(createError("Payment initialization failed", 500));
    }
  }
);

export const verifyPayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reference } = req.body;

    console.log("🔍 Starting payment verification for:", reference);

    const payment = await Payment.findOne({ reference }).populate("orderId");

    if (!payment) {
      console.error("❌ Payment not found for reference:", reference);
      return next(createError("Payment not found", 404));
    }

    if (payment.status === "SUCCESS") {
      console.log("✅ Payment already verified.");
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: payment,
      });
    }

    try {
      console.log("🌍 Verifying payment with Paystack...");

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data:any = await response.json();

      if (!data.status || data.data?.status !== "success") {
        console.error("❌ Paystack verification failed:", data.message);
        payment.status = "FAILED";
        payment.failureReason = data.message || "Unknown failure";
        await payment.save();

        return next(createError("Payment verification failed", 400));
      }

      const transactionData = data.data;

      console.log("✅ Paystack confirmed payment success.");
      payment.status = "SUCCESS";
      payment.paidAt = new Date();
      payment.gatewayResponse = transactionData;
      payment.channel = transactionData.channel;
      await payment.save();

      const order = await Order.findById(payment.orderId);

      if (!order) {
        console.error("❌ Order not found for payment:", payment.orderId);
        return next(createError("Order not found", 404));
      }

      console.log("📝 Updating order with payment status...");
      order.paymentStatus = "PAID";
      order.status = "DELIVERED"; // You might want to use "PROCESSING" or "CONFIRMED" instead
      order.paymentReference = reference;
      order.deliveredAt = new Date();
      await order.save();

      // Update product sold counts
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { soldCount: item.quantity },
        });
      }

      // Clear user's cart
      await User.findByIdAndUpdate(payment.userId, {
        cart: { items: [] },
      });

      try {
        const io = SocketService.getIO();
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

        console.log("📢 Socket events emitted.");
      } catch (socketError) {
        console.error("⚠️ Socket emit error:", socketError);
      }

      res.status(200).json({
        success: true,
        message: "Payment verified and order updated",
        data: payment,
      });
    } catch (error) {
      console.error("❌ Unexpected error during verification:", error);
      return next(createError("Payment verification failed", 500));
    }
  }
);



export const getUserPayments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId: user._id })
      .populate({
        path: "orderId",
        select: "orderNumber total items",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ userId: user._id });

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
  }
);

export const refundPayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { amount, reason } = req.body;

    if (user.role !== "ADMIN") {
      return next(createError("Unauthorized", 403));
    }

    const payment = await Payment.findById(req.params.id).populate("orderId");
    if (!payment) {
      return next(createError("Payment not found", 404));
    }

    if (payment.status !== "SUCCESS") {
      return next(createError("Payment cannot be refunded", 400));
    }

    const refundAmount = amount || payment.amount;
    const refundReference = `REF-${Date.now()}`;

    try {
      const response = await fetch("https://api.paystack.co/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: payment.reference,
          amount: Math.round(refundAmount * 100),
          currency: payment.currency,
          customer_note: reason,
          merchant_note: `Refund for order ${(payment.orderId as any).orderNumber}`,
        }),
      });

      const data = (await response.json()) as {
        status: boolean;
        [key: string]: any;
      };

      if (!data.status) {
        return next(createError("Refund failed", 400));
      }

      payment.status = "REFUNDED";
      payment.refundAmount = refundAmount;
      payment.refundedAt = new Date();
      payment.refundReference = refundReference;
      await payment.save();

      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = "REFUNDED";
        order.refundAmount = refundAmount;
        order.refundReason = reason;
        await order.save();
      }

      try {
        const io = SocketService.getIO();
        io.to(payment.userId.toString()).emit("payment:refunded", {
          orderId: payment.orderId,
          reference: payment.reference,
          amount: refundAmount,
        });
      } catch (error) {
        console.log("Socket emit error:", error);
      }

      try {
        await createNotification({
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
      } catch (error) {
        console.error("Failed to create payment refund notification:", error);
      }

      res.status(200).json({
        success: true,
        message: "Payment refunded successfully",
        data: payment,
      });
    } catch (error) {
      console.error("Refund error:", error);
      return next(createError("Refund failed", 500));
    }
  }
);
