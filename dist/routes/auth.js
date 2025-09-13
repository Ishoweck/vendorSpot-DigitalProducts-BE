"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("@/controllers/authController");
const auth_1 = require("@/middleware/auth");
const validate_1 = require("@/middleware/validate");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("firstName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("First name must be at least 2 characters long"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Last name must be at least 2 characters long"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isMobilePhone("any")
        .withMessage("Please provide a valid phone number"),
];
const loginValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)("token").notEmpty().withMessage("Reset token is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];
const verifyEmailOTPValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("otp")
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage("Please provide a valid 6-digit verification code"),
];
router.post("/register", registerValidation, validate_1.validate, authController_1.register);
router.post("/login", loginValidation, validate_1.validate, authController_1.login);
router.post("/logout", auth_1.authenticate, authController_1.logout);
router.post("/refresh", authController_1.refreshToken);
router.post("/forgot-password", forgotPasswordValidation, validate_1.validate, authController_1.forgotPassword);
router.post("/reset-password", resetPasswordValidation, validate_1.validate, authController_1.resetPassword);
router.post("/verify-email-otp", verifyEmailOTPValidation, validate_1.validate, authController_1.verifyEmailOTP);
router.post("/resend-verification-otp", forgotPasswordValidation, validate_1.validate, authController_1.resendVerificationOTP);
router.get("/me", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        let vendor = null;
        if (user.role === "VENDOR") {
            const { Vendor } = await Promise.resolve().then(() => __importStar(require("@/models/Vendor")));
            vendor = await Vendor.findOne({ userId: user._id });
        }
        const userResponse = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
            shippingAddresses: user.shippingAddresses || [],
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
            message: "User retrieved successfully",
            data: userResponse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve user information",
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map