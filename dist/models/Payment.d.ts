import mongoose, { Document } from "mongoose";
export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    reference: string;
    gateway: "PAYSTACK" | "BANK_TRANSFER" | "WALLET";
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
    gatewayResponse?: any;
    channel?: string;
    paidAt?: Date;
    failureReason?: string;
    refundAmount?: number;
    refundedAt?: Date;
    refundReference?: string;
    metadata?: any;
    idempotencyKey: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map