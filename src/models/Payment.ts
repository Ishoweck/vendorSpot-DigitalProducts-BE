import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reference: string;
  gateway: "PAYSTACK" | "BANK_TRANSFER" | "WALLET";
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
  gatewayResponse?: any;
  channel?: string;
  paidAt?: Date;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  refundReference?: string;
  metadata?: any;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  gateway: {
    type: String,
    enum: ["PAYSTACK", "BANK_TRANSFER", "WALLET"],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "NGN"
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
    default: "PENDING"
  },
  gatewayResponse: Schema.Types.Mixed,
  channel: String,
  paidAt: Date,
  failureReason: String,
  refundAmount: {
    type: Number,
    min: 0
  },
  refundedAt: Date,
  refundReference: String,
  metadata: Schema.Types.Mixed,
  idempotencyKey: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);