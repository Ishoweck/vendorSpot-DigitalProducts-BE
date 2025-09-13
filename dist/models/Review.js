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
exports.Review = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    helpfulBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    reportedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    reportCount: {
        type: Number,
        default: 0,
    },
    response: {
        message: String,
        respondedAt: Date,
        respondedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    },
}, {
    timestamps: true,
});
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ vendorId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
exports.Review = mongoose_1.default.model("Review", reviewSchema);
//# sourceMappingURL=Review.js.map