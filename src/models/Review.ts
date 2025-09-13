import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  moderationReason?: string;
  helpfulCount: number;
  helpfulBy?: mongoose.Types.ObjectId[];
  reportedBy?: mongoose.Types.ObjectId[];
  reportCount: number;
  response?: {
    message: string;
    respondedAt: Date;
    respondedBy: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "HIDDEN"],
      default: "PENDING",
    },
    moderationReason: String,
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reportedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reportCount: {
      type: Number,
      default: 0,
    },
    response: {
      message: String,
      respondedAt: Date,
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ vendorId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
