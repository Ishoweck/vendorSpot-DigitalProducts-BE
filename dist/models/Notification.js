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
exports.Notification = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: [
            "ORDER_CREATED",
            "ORDER_CONFIRMED",
            "ORDER_SHIPPED",
            "ORDER_DELIVERED",
            "ORDER_CANCELLED",
            "ORDER_REFUNDED",
            "PAYMENT_SUCCESS",
            "PAYMENT_FAILED",
            "PAYMENT_REFUNDED",
            "PAYMENT_PENDING",
            "PRODUCT_APPROVED",
            "PRODUCT_REJECTED",
            "PRODUCT_UPDATED",
            "PRODUCT_DISCONTINUED",
            "REVIEW_ADDED",
            "REVIEW_HELPFUL",
            "REVIEW_REPORTED",
            "REVIEW_RESPONSE",
            "VERIFICATION_SUBMITTED",
            "VENDOR_APPROVED",
            "VENDOR_REJECTED",
            "VENDOR_SUSPENDED",
            "SYSTEM_ANNOUNCEMENT",
            "PROMOTION",
            "WELCOME",
            "PROFILE_UPDATED",
            "PASSWORD_CHANGED",
            "ACCOUNT_VERIFIED",
            "SECURITY_ALERT",
            "PRICE_DROP",
            "STOCK_ALERT",
            "NEW_FEATURE",
            "MAINTENANCE_NOTICE",
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 100,
    },
    message: {
        type: String,
        required: true,
        maxlength: 500,
    },
    data: mongoose_1.Schema.Types.Mixed,
    isRead: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        enum: [
            "ORDER",
            "PAYMENT",
            "PRODUCT",
            "REVIEW",
            "ACCOUNT",
            "SYSTEM",
            "PROMOTION",
            "SECURITY",
            "FEATURE",
        ],
        required: true,
    },
    priority: {
        type: String,
        enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
        default: "NORMAL",
    },
    channels: [
        {
            type: String,
            enum: ["EMAIL", "IN_APP", "PUSH", "SMS"],
        },
    ],
    emailSent: {
        type: Boolean,
        default: false,
    },
    pushSent: {
        type: Boolean,
        default: false,
    },
    smsSent: {
        type: Boolean,
        default: false,
    },
    readAt: Date,
    expiresAt: Date,
}, {
    timestamps: true,
});
notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, category: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
exports.Notification = mongoose_1.default.model("Notification", notificationSchema);
//# sourceMappingURL=Notification.js.map