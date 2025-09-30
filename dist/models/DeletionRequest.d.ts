import mongoose from "mongoose";
export declare const DeletionRequest: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
    accountId: mongoose.Types.ObjectId;
    accountType: "User" | "Vendor";
    requestedBy: mongoose.Types.ObjectId;
    submittedByAdmin: boolean;
    requestedAt: NativeDate;
    reason?: string | null | undefined;
    decisionReason?: string | null | undefined;
    decidedBy?: mongoose.Types.ObjectId | null | undefined;
    decidedAt?: NativeDate | null | undefined;
    deletedAt?: NativeDate | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
    accountId: mongoose.Types.ObjectId;
    accountType: "User" | "Vendor";
    requestedBy: mongoose.Types.ObjectId;
    submittedByAdmin: boolean;
    requestedAt: NativeDate;
    reason?: string | null | undefined;
    decisionReason?: string | null | undefined;
    decidedBy?: mongoose.Types.ObjectId | null | undefined;
    decidedAt?: NativeDate | null | undefined;
    deletedAt?: NativeDate | null | undefined;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
    accountId: mongoose.Types.ObjectId;
    accountType: "User" | "Vendor";
    requestedBy: mongoose.Types.ObjectId;
    submittedByAdmin: boolean;
    requestedAt: NativeDate;
    reason?: string | null | undefined;
    decisionReason?: string | null | undefined;
    decidedBy?: mongoose.Types.ObjectId | null | undefined;
    decidedAt?: NativeDate | null | undefined;
    deletedAt?: NativeDate | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
    accountId: mongoose.Types.ObjectId;
    accountType: "User" | "Vendor";
    requestedBy: mongoose.Types.ObjectId;
    submittedByAdmin: boolean;
    requestedAt: NativeDate;
    reason?: string | null | undefined;
    decisionReason?: string | null | undefined;
    decidedBy?: mongoose.Types.ObjectId | null | undefined;
    decidedAt?: NativeDate | null | undefined;
    deletedAt?: NativeDate | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
    accountId: mongoose.Types.ObjectId;
    accountType: "User" | "Vendor";
    requestedBy: mongoose.Types.ObjectId;
    submittedByAdmin: boolean;
    requestedAt: NativeDate;
    reason?: string | null | undefined;
    decisionReason?: string | null | undefined;
    decidedBy?: mongoose.Types.ObjectId | null | undefined;
    decidedAt?: NativeDate | null | undefined;
    deletedAt?: NativeDate | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
    accountId: mongoose.Types.ObjectId;
    accountType: "User" | "Vendor";
    requestedBy: mongoose.Types.ObjectId;
    submittedByAdmin: boolean;
    requestedAt: NativeDate;
    reason?: string | null | undefined;
    decisionReason?: string | null | undefined;
    decidedBy?: mongoose.Types.ObjectId | null | undefined;
    decidedAt?: NativeDate | null | undefined;
    deletedAt?: NativeDate | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=DeletionRequest.d.ts.map