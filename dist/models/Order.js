"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const shippingAddressSchema = new mongoose_1.Schema({
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
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "items.vendorId": 1 });
orderSchema.index({ createdAt: -1 });
exports.Order = mongoose_1.default.model("Order", orderSchema);
//# sourceMappingURL=Order.js.map