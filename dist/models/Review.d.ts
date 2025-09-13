import mongoose, { Document } from "mongoose";
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
export declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Review.d.ts.map