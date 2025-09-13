import mongoose, { Document } from "mongoose";
export interface IVendor extends Document {
    userId: mongoose.Types.ObjectId;
    businessName: string;
    businessDescription?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    website?: string;
    logo?: string;
    banner?: string;
    taxId?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    verificationStatus: "NOT_VERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
    verificationDocuments: string[];
    rating: number;
    totalSales: number;
    totalProducts: number;
    commissionRate: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Vendor: mongoose.Model<IVendor, {}, {}, {}, mongoose.Document<unknown, {}, IVendor, {}, {}> & IVendor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Vendor.d.ts.map