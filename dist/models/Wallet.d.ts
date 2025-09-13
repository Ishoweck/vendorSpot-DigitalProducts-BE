import mongoose, { Document } from "mongoose";
export type WalletTransactionType = "payment_received" | "withdrawal";
export interface IWalletTransaction {
    type: string;
    title: string;
    description: string;
    amount: number;
    timestamp: Date;
    isPositive: boolean;
}
export interface IWallet extends Document {
    userId: mongoose.Types.ObjectId;
    availableBalance: number;
    totalEarnings: number;
    thisMonth: number;
    transactions: IWalletTransaction[];
    updatedAt: Date;
    createdAt: Date;
}
export declare const Wallet: mongoose.Model<IWallet, {}, {}, {}, mongoose.Document<unknown, {}, IWallet, {}, {}> & IWallet & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Wallet.d.ts.map