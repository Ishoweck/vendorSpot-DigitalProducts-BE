import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmailOTP,
  resendVerificationOTP,
} from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";
import { validate } from "@/middleware/validate";

const router: Router = Router();

const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const verifyEmailOTPValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("Please provide a valid 6-digit verification code"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refreshToken);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPassword
);
router.post(
  "/verify-email-otp",
  verifyEmailOTPValidation,
  validate,
  verifyEmailOTP
);
router.post(
  "/resend-verification-otp",
  forgotPasswordValidation,
  validate,
  resendVerificationOTP
);

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = req.user as any;

    let vendor = null;
    if (user.role === "VENDOR") {
      const { Vendor } = await import("@/models/Vendor");
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user information",
    });
  }
});

export default router;
