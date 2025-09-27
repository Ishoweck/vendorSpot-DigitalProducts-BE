import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    password: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: "MALE" | "FEMALE" | "OTHER";
    address?: string;
    city?: string;
    state?: string;
    country: string;
    postalCode?: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN" | "MODERATOR" | "SUPERADMIN";
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
    lastLoginAt?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    emailVerificationOTP?: string;
    emailVerificationOTPExpires?: Date;
    wishlist?: mongoose.Types.ObjectId[];
    cart?: {
        items: Array<{
            productId: mongoose.Types.ObjectId;
            quantity: number;
            addedAt: Date;
        }>;
    };
    shippingAddresses?: Array<{
        _id: mongoose.Types.ObjectId;
        fullName: string;
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode?: string;
        phone: string;
        isDefault: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map