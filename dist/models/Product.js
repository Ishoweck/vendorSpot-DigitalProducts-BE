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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
productSchema.index({ vendorId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1, isApproved: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
exports.Product = mongoose_1.default.model("Product", productSchema);
//# sourceMappingURL=Product.js.map