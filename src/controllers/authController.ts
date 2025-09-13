import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "@/models/User";
import { Vendor } from "@/models/Vendor";
import { config } from "@/config/config";
import { emailService } from "@/services/emailService";
import { logger } from "@/utils/logger";
import { asyncHandler, createError } from "@/middleware/errorHandler";
import { createNotification } from "./NotificationController";
import { Wallet } from "@/models/Wallet";

const generateTokens = (userId: string) => {
  const signOptions: jwt.SignOptions = {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  };

  const refreshSignOptions: jwt.SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  };

  const token = jwt.sign(
    { id: userId },
    Buffer.from(config.jwtSecret),
    signOptions
  );

  const refreshToken = jwt.sign(
    { id: userId },
    Buffer.from(config.jwtSecret),
    refreshSignOptions
  );

  return { token, refreshToken };
};

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      isVendor,
      businessName,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return next(createError("All required fields must be provided", 400));
    }

    if (password.length < 6) {
      return next(createError("Password must be at least 6 characters", 400));
    }

    if (isVendor && !businessName) {
      return next(createError("Business name is required for vendors", 400));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(createError("User with this email already exists", 409));
    }

    if (phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        return next(
          createError(
            "This phone number is already registered. Please use a different number or try logging in.",
            409
          )
        );
      }
    }

    const role = isVendor ? "VENDOR" : "CUSTOMER";

    const user = await User.create({
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

           const wallet = await Wallet.create({
          userId: user._id,
          availableBalance: 0,
          totalEarnings: 0,
          transactions: [],
        });
        vendor = await Vendor.create({
          userId: user._id,
          businessName,
          walletId: wallet._id, 

        });

     
        logger.info(`Vendor record created for user: ${user.email}`, {
          userId: String(user._id),
          vendorId: String(vendor._id),
          businessName,
        });
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        logger.error(`Failed to create vendor record for ${user.email}:`, {
          error: error instanceof Error ? error.message : String(error),
          userId: String(user._id),
        });
        return next(createError("Failed to create vendor account", 500));
      }
    }

    const { token, refreshToken } = generateTokens(String(user._id));

    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
      logger.info(`Welcome email sent to ${user.email}`, {
        userId: String(user._id),
        email: user.email,
      });
    } catch (error) {
      logger.error(`Failed to send welcome email to ${user.email}:`, {
        error: error instanceof Error ? error.message : String(error),
        userId: String(user._id),
      });
    }

    try {
      await createNotification({
        userId: String(user._id),
        type: "WELCOME",
        title: "Welcome to Vendorspot!",
        message: `Hi ${user.firstName}, welcome to Vendorspot! We're excited to have you on board.`,
        category: "ACCOUNT",
        priority: "NORMAL",
        channels: ["IN_APP"],
      });
    } catch (error) {
      logger.error(`Failed to create welcome notification for ${user.email}:`, {
        error: error instanceof Error ? error.message : String(error),
        userId: String(user._id),
      });
    }

    const verificationOTP = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = verificationOTP;
    user.emailVerificationOTPExpires = verificationOTPExpiry;

    console.log(verifyEmailOTP);
    
    await user.save();

    try {
      await emailService.sendVerificationOTPEmail(
        user.email,
        user.firstName,
        verificationOTP
      );

      if (config.nodeEnv === "development") {
        logger.info(
          `🔢 VERIFICATION OTP (DEV): ${verificationOTP} for ${user.email}`
        );
      }

      logger.info(`Email verification OTP sent to ${user.email}`, {
        userId: String(user._id),
        email: user.email,
        otpExpiry: verificationOTPExpiry,
      });
    } catch (error) {
      logger.error(`Failed to send verification email to ${user.email}:`, {
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
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError("Email and password are required", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(createError("Invalid email or password", 401));
    }

    if (user.status !== "ACTIVE") {
      return next(createError("Account is not active", 401));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save();
      return next(createError("Invalid email or password", 401));
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return next(
        createError("Account is temporarily locked. Try again later", 423)
      );
    }

    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const { token, refreshToken } = generateTokens(String(user._id));

    let vendor = null;
    if (user.role === "VENDOR") {
      vendor = await Vendor.findOne({ userId: user._id });
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
  }
);

export const logout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError("Refresh token is required", 400));
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwtSecret as string
      ) as any;
      const user = await User.findById(decoded.id);

      if (!user || user.status !== "ACTIVE") {
        return next(createError("Invalid refresh token", 401));
      }

      const { token: newToken, refreshToken: newRefreshToken } = generateTokens(
        String(user._id)
      );

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return next(createError("Invalid refresh token", 401));
    }
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(createError("Email is required", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent",
    });

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken
      );

      if (config.nodeEnv === "development") {
        const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
        logger.info(`🔗 PASSWORD RESET URL (DEV): ${resetUrl}`);
      }

      logger.info(`Password reset email sent to ${user.email}`, {
        userId: String(user._id),
        email: user.email,
        resetToken,
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      logger.error(`Failed to send password reset email to ${user.email}:`, {
        error: error instanceof Error ? error.message : String(error),
        userId: String(user._id),
      });
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(createError("Token and password are required", 400));
    }

    if (password.length < 6) {
      return next(createError("Password must be at least 6 characters", 400));
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(createError("Invalid or expired reset token", 400));
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
  }
);

export const verifyEmailOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(createError("Email and OTP are required", 400));
    }

    // Debug logging
    logger.info(`Attempting to verify email OTP for: ${email}`);

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: { $gt: new Date() },
    });

    if (!user) {
      const userWithExpiredOTP = await User.findOne({
        email: email.toLowerCase(),
        emailVerificationOTP: otp,
      });

      if (userWithExpiredOTP) {
        logger.warn(`Verification OTP expired for user: ${email}`);
        return next(createError("Verification code has expired", 400));
      }

      const verifiedUser = await User.findOne({
        email: email.toLowerCase(),
        isEmailVerified: true,
      });

      if (verifiedUser) {
        return next(createError("Email is already verified", 400));
      }

      logger.warn(`Invalid verification OTP for: ${email}`);
      return next(createError("Invalid verification code", 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    logger.info(`Email verified successfully for: ${email}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  }
);

export const resendVerificationOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(createError("Email is required", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return next(createError("User not found", 404));
    }

    if (user.isEmailVerified) {
      return next(createError("Email is already verified", 400));
    }

    const verificationOTP = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = verificationOTP;
    user.emailVerificationOTPExpires = verificationOTPExpiry;
    await user.save();

    try {
      await emailService.sendVerificationOTPEmail(
        user.email,
        user.firstName,
        verificationOTP
      );

      if (config.nodeEnv === "development") {
        logger.info(
          `� RESSEND VERIFICATION OTP (DEV): ${verificationOTP} for ${user.email}`
        );
      }

      logger.info(`Verification OTP resent to ${user.email}`, {
        userId: String(user._id),
        email: user.email,
        otpExpiry: verificationOTPExpiry,
      });
    } catch (error) {
      logger.error(`Failed to send verification OTP to ${user.email}:`, {
        error: error instanceof Error ? error.message : String(error),
        userId: String(user._id),
        reason: "verification_otp_failed",
      });
      return next(createError("Failed to send verification code", 500));
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });
  }
);
