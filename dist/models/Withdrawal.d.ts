import mongoose, { Document } from "mongoose";
export interface IWithdrawal extends Document {
    userId: mongoose.Types.ObjectId;
    reference: string;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
    gateway: "BANK_TRANSFER" | "WALLET";
    withdrawalDetails: {
        bankAccount: string;
        bankName: string;
        accountName?: string;
    };
    failureReason?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Withdrawal: mongoose.Model<IWithdrawal, {}, {}, {}, mongoose.Document<unknown, {}, IWithdrawal, {}, {}> & IWithdrawal & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Withdrawal.d.ts.map