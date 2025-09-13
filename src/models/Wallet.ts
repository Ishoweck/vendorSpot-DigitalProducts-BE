import mongoose, { Document, Schema } from "mongoose";

export type WalletTransactionType = "payment_received" | "withdrawal";

export interface IWalletTransaction {
  type: string;
  title: string;
  description: string;
  amount: number;
  timestamp: Date;
  isPositive: boolean;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  availableBalance: number;
  totalEarnings: number;
  thisMonth: number;
  transactions: IWalletTransaction[];
  updatedAt: Date;
  createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: {
      type: String,
      enum: ["payment_received", "withdrawal"],
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    isPositive: { type: Boolean, required: true },
  },
  { _id: false }
);

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    thisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true }
);

walletSchema.index({ userId: 1 });

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
