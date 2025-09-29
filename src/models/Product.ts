import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  vendorId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isDigital: boolean;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  previewUrl?: string;
  thumbnail?: string;
  images: string[];
  tags: string[];
  features: string[];
  requirements?: string;
  instructions?: string;
  licenseType?:
    | "SINGLE_USE"
    | "MULTIPLE_USE"
    | "UNLIMITED"
    | "TIME_LIMITED"
    | "SUBSCRIPTION";
  licenseDuration?: number;
  downloadLimit?: number;
  linkUrl?: string;
  isLink?: boolean; // default: false
  isActive: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  viewCount: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    isDigital: {
      type: Boolean,
      default: true,
    },
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    previewUrl: String,
    thumbnail: String,
    images: [String],
    tags: [String],
    features: [String],
    requirements: String,
    instructions: String,
    licenseType: {
      type: String,
      enum: [
        "SINGLE_USE",
        "MULTIPLE_USE",
        "UNLIMITED",
        "TIME_LIMITED",
        "SUBSCRIPTION",
      ],
    },
    licenseDuration: Number,
    downloadLimit: {
      type: Number,
      default: -1,
    },
    linkUrl: {
  type: String,
},

isLink: {
  type: Boolean,
  default: false,
},

    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: String,
    viewCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ vendorId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1, isApproved: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
