import mongoose, { Document } from "mongoose";
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
    licenseType?: "SINGLE_USE" | "MULTIPLE_USE" | "UNLIMITED" | "TIME_LIMITED" | "SUBSCRIPTION";
    licenseDuration?: number;
    downloadLimit?: number;
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
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map