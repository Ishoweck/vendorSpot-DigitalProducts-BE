import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { Payment } from "@/models/Payment";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { asyncHandler, createError } from "@/middleware/errorHandler";
import { SocketService } from "@/services/SocketService";
import { createNotification } from "./NotificationController";
import config from "@/config/config";

export const paystackWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const hash = crypto
      .createHmac("sha512", config.paystackSecretKey)
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
  }
);

const handleSuccessfulPayment = async (data: any) => {
  try {
    const payment = await Payment.findOne({ reference: data.reference });
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

    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = "PAID";
      order.status = "DELIVERED";
      order.paymentReference = data.reference;
      order.deliveredAt = new Date();
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { soldCount: item.quantity },
        });
      }

      await User.findByIdAndUpdate(payment.userId, {
        cart: { items: [] },
      });

      await createNotification({
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
        await createNotification({
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
        const io = SocketService.getIO();
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
      } catch (error) {
        console.log("Socket emit error:", error);
      }
    }

    console.log(`Payment successful: ${data.reference}`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
};

const handleFailedPayment = async (data: any) => {
  try {
    const payment = await Payment.findOne({ reference: data.reference });
    if (!payment) {
      console.log(`Payment not found for reference: ${data.reference}`);
      return;
    }

    payment.status = "FAILED";
    payment.failureReason = data.gateway_response;
    payment.gatewayResponse = data;
    await payment.save();

    try {
      await createNotification({
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
    } catch (error) {
      console.error("Failed to create payment failure notification:", error);
    }

    try {
      const io = SocketService.getIO();
      io.to(payment.userId.toString()).emit("payment:failed", {
        orderId: payment.orderId,
        reference: data.reference,
        reason: data.gateway_response,
      });
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    console.log(`Payment failed: ${data.reference}`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
};

const handleSuccessfulTransfer = async (data: any) => {
  try {
    console.log(`Transfer successful: ${data.reference}`, data);
  } catch (error) {
    console.error("Error handling successful transfer:", error);
  }
};

const handleFailedTransfer = async (data: any) => {
  try {
    console.log(`Transfer failed: ${data.reference}`, data);
  } catch (error) {
    console.error("Error handling failed transfer:", error);
  }
};

const handleRefundProcessed = async (data: any) => {
  try {
    const payment = await Payment.findOne({
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

      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = "REFUNDED";
        order.refundAmount = data.amount / 100;
        await order.save();
      }

      try {
        const io = SocketService.getIO();
        io.to(payment.userId.toString()).emit("payment:refunded", {
          orderId: payment.orderId,
          reference: payment.reference,
          amount: data.amount / 100,
        });
      } catch (error) {
        console.log("Socket emit error:", error);
      }
    }

    console.log(`Refund processed: ${data.reference}`);
  } catch (error) {
    console.error("Error handling refund processed:", error);
  }
};
