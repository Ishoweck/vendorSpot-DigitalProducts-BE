import mongoose, { Document } from "mongoose";
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
    status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
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
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map