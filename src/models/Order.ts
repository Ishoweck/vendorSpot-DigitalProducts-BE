import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  licenseKey?: string;
  downloadUrl?: string;
  downloadCount: number;
  downloadLimit: number;
  lastDownloadAt?: Date;
}

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  currency: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: "PAYSTACK" | "BANK_TRANSFER" | "WALLET";
  paymentReference?: string;
  shippingAddress?: IShippingAddress;
  shippingMethod?: "STANDARD" | "EXPRESS" | "SAME_DAY";
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  licenseKey: String,
  downloadUrl: String,
  downloadCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  downloadLimit: {
    type: Number,
    default: -1,
    min: -1,
  },
  lastDownloadAt: Date,
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "Nigeria",
  },
  postalCode: String,
  phone: {
    type: String,
    required: true,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
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
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["PAYSTACK", "BANK_TRANSFER", "WALLET"],
      default: "PAYSTACK",
    },
    paymentReference: String,
    shippingAddress: shippingAddressSchema,
    shippingMethod: {
      type: String,
      enum: ["STANDARD", "EXPRESS", "SAME_DAY"],
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "items.vendorId": 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
