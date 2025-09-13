import mongoose, { Document, Schema } from "mongoose";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  reference: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  gateway: "BANK_TRANSFER" | "WALLET"; 
  withdrawalDetails: {
    bankAccount: string;
    bankName: string;
    accountName?: string;
  };
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    gateway: {
      type: String,
      enum: ["BANK_TRANSFER", "WALLET"],
      required: true,
    },
    withdrawalDetails: {
      bankAccount: { type: String, required: true },
      bankName: { type: String, required: true },
      accountName: String,
    },
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true }
);

withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

export const Withdrawal = mongoose.model<IWithdrawal>(
  "Withdrawal",
  withdrawalSchema
);
