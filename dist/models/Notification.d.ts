import mongoose, { Document } from "mongoose";
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: "ORDER_CREATED" | "ORDER_CONFIRMED" | "ORDER_SHIPPED" | "ORDER_DELIVERED" | "ORDER_CANCELLED" | "ORDER_REFUNDED" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "PAYMENT_REFUNDED" | "PAYMENT_PENDING" | "PRODUCT_APPROVED" | "PRODUCT_REJECTED" | "PRODUCT_UPDATED" | "PRODUCT_DISCONTINUED" | "REVIEW_ADDED" | "REVIEW_HELPFUL" | "REVIEW_REPORTED" | "REVIEW_RESPONSE" | "VERIFICATION_SUBMITTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "VENDOR_SUSPENDED" | "SYSTEM_ANNOUNCEMENT" | "PROMOTION" | "WELCOME" | "PROFILE_UPDATED" | "PASSWORD_CHANGED" | "ACCOUNT_VERIFIED" | "SECURITY_ALERT" | "PRICE_DROP" | "STOCK_ALERT" | "NEW_FEATURE" | "MAINTENANCE_NOTICE";
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    category: "ORDER" | "PAYMENT" | "PRODUCT" | "REVIEW" | "ACCOUNT" | "SYSTEM" | "PROMOTION" | "SECURITY" | "FEATURE";
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    channels: ("EMAIL" | "IN_APP" | "PUSH" | "SMS")[];
    emailSent?: boolean;
    pushSent?: boolean;
    smsSent?: boolean;
    readAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map