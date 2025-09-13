"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationOTP = exports.verifyEmailOTP = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const Vendor_1 = require("../models/Vendor");
const config_1 = require("../config/config");
const emailService_1 = require("../services/emailService");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const NotificationController_1 = require("./NotificationController");
const Wallet_1 = require("../models/Wallet");
const generateTokens = (userId) => {
    const signOptions = {
        expiresIn: config_1.config.jwtExpiresIn,
        algorithm: "HS256",
    };
    const refreshSignOptions = {
        expiresIn: config_1.config.jwtRefreshExpiresIn,
        algorithm: "HS256",
    };
    const token = jsonwebtoken_1.default.sign({ id: userId }, Buffer.from(config_1.config.jwtSecret), signOptions);
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, Buffer.from(config_1.config.jwtSecret), refreshSignOptions);
    return { token, refreshToken };
};
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password, firstName, lastName, phone, isVendor, businessName, } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return next((0, errorHandler_1.createError)("All required fields must be provided", 400));
    }
    if (password.length < 6) {
        return next((0, errorHandler_1.createError)("Password must be at least 6 characters", 400));
    }
    if (isVendor && !businessName) {
        return next((0, errorHandler_1.createError)("Business name is required for vendors", 400));
    }
    const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return next((0, errorHandler_1.createError)("User with this email already exists", 409));
    }
    if (phone) {
        const existingPhoneUser = await User_1.User.findOne({ phone });
        if (existingPhoneUser) {
            return next((0, errorHandler_1.createError)("This phone number is already registered. Please use a different number or try logging in.", 409));
        }
    }
    const role = isVendor ? "VENDOR" : "CUSTOMER";
    const user = await User_1.User.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role,
    });
    let vendor = null;
    if (isVendor && businessName) {
        try {
            const wallet = await Wallet_1.Wallet.create({
                userId: user._id,
                availableBalance: 0,
                totalEarnings: 0,
                transactions: [],
            });
            vendor = await Vendor_1.Vendor.create({
                userId: user._id,
                businessName,
                walletId: wallet._id,
            });
            logger_1.logger.info(`Vendor record created for user: ${user.email}`, {
                userId: String(user._id),
                vendorId: String(vendor._id),
                businessName,
            });
        }
        catch (error) {
            await User_1.User.findByIdAndDelete(user._id);
            logger_1.logger.error(`Failed to create vendor record for ${user.email}:`, {
                error: error instanceof Error ? error.message : String(error),
                userId: String(user._id),
            });
            return next((0, errorHandler_1.createError)("Failed to create vendor account", 500));
        }
    }
    const { token, refreshToken } = generateTokens(String(user._id));
    try {
        await emailService_1.emailService.sendWelcomeEmail(user.email, user.firstName);
        logger_1.logger.info(`Welcome email sent to ${user.email}`, {
            userId: String(user._id),
            email: user.email,
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to send welcome email to ${user.email}:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: String(user._id),
        });
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: String(user._id),
            type: "WELCOME",
            title: "Welcome to Vendorspot!",
            message: `Hi ${user.firstName}, welcome to Vendorspot! We're excited to have you on board.`,
            category: "ACCOUNT",
            priority: "NORMAL",
            channels: ["IN_APP"],
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to create welcome notification for ${user.email}:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: String(user._id),
        });
    }
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationOTP = verificationOTP;
    user.emailVerificationOTPExpires = verificationOTPExpiry;
    console.log(exports.verifyEmailOTP);
    await user.save();
    try {
        await emailService_1.emailService.sendVerificationOTPEmail(user.email, user.firstName, verificationOTP);
        if (config_1.config.nodeEnv === "development") {
            logger_1.logger.info(`🔢 VERIFICATION OTP (DEV): ${verificationOTP} for ${user.email}`);
        }
        logger_1.logger.info(`Email verification OTP sent to ${user.email}`, {
            userId: String(user._id),
            email: user.email,
            otpExpiry: verificationOTPExpiry,
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to send verification email to ${user.email}:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: String(user._id),
        });
    }
    const userResponse = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        businessName: vendor?.businessName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
            user: userResponse,
            token,
            refreshToken,
        },
    });
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next((0, errorHandler_1.createError)("Email and password are required", 400));
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return next((0, errorHandler_1.createError)("Invalid email or password", 401));
    }
    if (user.status !== "ACTIVE") {
        return next((0, errorHandler_1.createError)("Account is not active", 401));
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        }
        await user.save();
        return next((0, errorHandler_1.createError)("Invalid email or password", 401));
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        return next((0, errorHandler_1.createError)("Account is temporarily locked. Try again later", 423));
    }
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();
    const { token, refreshToken } = generateTokens(String(user._id));
    let vendor = null;
    if (user.role === "VENDOR") {
        vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    }
    const userResponse = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        businessName: vendor?.businessName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: userResponse,
            token,
            refreshToken,
        },
    });
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (_req, res, _next) => {
    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});
exports.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return next((0, errorHandler_1.createError)("Refresh token is required", 400));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.id);
        if (!user || user.status !== "ACTIVE") {
            return next((0, errorHandler_1.createError)("Invalid refresh token", 401));
        }
        const { token: newToken, refreshToken: newRefreshToken } = generateTokens(String(user._id));
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        return next((0, errorHandler_1.createError)("Invalid refresh token", 401));
    }
});
exports.forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next((0, errorHandler_1.createError)("Email is required", 400));
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent",
    });
    if (!user) {
        return;
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();
    try {
        await emailService_1.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
        if (config_1.config.nodeEnv === "development") {
            const resetUrl = `${config_1.config.frontendUrl}/reset-password?token=${resetToken}`;
            logger_1.logger.info(`🔗 PASSWORD RESET URL (DEV): ${resetUrl}`);
        }
        logger_1.logger.info(`Password reset email sent to ${user.email}`, {
            userId: String(user._id),
            email: user.email,
            resetToken,
        });
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        logger_1.logger.error(`Failed to send password reset email to ${user.email}:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: String(user._id),
        });
    }
});
exports.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return next((0, errorHandler_1.createError)("Token and password are required", 400));
    }
    if (password.length < 6) {
        return next((0, errorHandler_1.createError)("Password must be at least 6 characters", 400));
    }
    const user = await User_1.User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
        return next((0, errorHandler_1.createError)("Invalid or expired reset token", 400));
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successful",
    });
});
exports.verifyEmailOTP = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return next((0, errorHandler_1.createError)("Email and OTP are required", 400));
    }
    logger_1.logger.info(`Attempting to verify email OTP for: ${email}`);
    const user = await User_1.User.findOne({
        email: email.toLowerCase(),
        emailVerificationOTP: otp,
        emailVerificationOTPExpires: { $gt: new Date() },
    });
    if (!user) {
        const userWithExpiredOTP = await User_1.User.findOne({
            email: email.toLowerCase(),
            emailVerificationOTP: otp,
        });
        if (userWithExpiredOTP) {
            logger_1.logger.warn(`Verification OTP expired for user: ${email}`);
            return next((0, errorHandler_1.createError)("Verification code has expired", 400));
        }
        const verifiedUser = await User_1.User.findOne({
            email: email.toLowerCase(),
            isEmailVerified: true,
        });
        if (verifiedUser) {
            return next((0, errorHandler_1.createError)("Email is already verified", 400));
        }
        logger_1.logger.warn(`Invalid verification OTP for: ${email}`);
        return next((0, errorHandler_1.createError)("Invalid verification code", 400));
    }
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();
    logger_1.logger.info(`Email verified successfully for: ${email}`);
    res.status(200).json({
        success: true,
        message: "Email verified successfully",
    });
});
exports.resendVerificationOTP = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next((0, errorHandler_1.createError)("Email is required", 400));
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (user.isEmailVerified) {
        return next((0, errorHandler_1.createError)("Email is already verified", 400));
    }
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationOTP = verificationOTP;
    user.emailVerificationOTPExpires = verificationOTPExpiry;
    await user.save();
    try {
        await emailService_1.emailService.sendVerificationOTPEmail(user.email, user.firstName, verificationOTP);
        if (config_1.config.nodeEnv === "development") {
            logger_1.logger.info(`� RESSEND VERIFICATION OTP (DEV): ${verificationOTP} for ${user.email}`);
        }
        logger_1.logger.info(`Verification OTP resent to ${user.email}`, {
            userId: String(user._id),
            email: user.email,
            otpExpiry: verificationOTPExpiry,
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to send verification OTP to ${user.email}:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: String(user._id),
            reason: "verification_otp_failed",
        });
        return next((0, errorHandler_1.createError)("Failed to send verification code", 500));
    }
    res.status(200).json({
        success: true,
        message: "Verification code sent successfully",
    });
});
//# sourceMappingURL=authController.js.map