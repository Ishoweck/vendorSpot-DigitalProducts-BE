"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env["NODE_ENV"] || "development",
    port: parseInt(process.env["PORT"] || "5000", 10),
    mongodbUri: process.env["MONGODB_URI"] || "mongodb://localhost:27017/vendorspot",
    jwtSecret: process.env["JWT_SECRET"] ||
        "your-super-secret-jwt-key-change-in-production",
    jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "15m",
    jwtRefreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "7d",
    paystackSecretKey: process.env["PAYSTACK_SECRET_KEY"] || "",
    paystackPublicKey: process.env["PAYSTACK_PUBLIC_KEY"] || "",
    resendApiKey: process.env["RESEND_API_KEY"] || "",
    emailFrom: process.env["EMAIL_FROM"] || "noreply@vendorspot.com",
    frontendUrl: process.env["FRONTEND_URL"] || "http://localhost:3000",
    corsOrigins: process.env["CORS_ORIGINS"]
        ? process.env["CORS_ORIGINS"].split(",")
        : ["http://localhost:3000", "https://your-frontend-domain.vercel.app"],
    maxFileSize: parseInt(process.env["MAX_FILE_SIZE"] || "10485760", 10),
    allowedFileTypes: process.env["ALLOWED_FILE_TYPES"]
        ? process.env["ALLOWED_FILE_TYPES"].split(",")
        : [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "pdf",
            "doc",
            "docx",
            "zip",
            "rar",
            "mp4",
            "mp3",
            "wav",
        ],
    bcryptRounds: parseInt(process.env["BCRYPT_ROUNDS"] || "12", 10),
    cloudinaryUrl: process.env["CLOUDINARY_URL"] || "",
    cloudinaryCloudName: process.env["CLOUDINARY_CLOUD_NAME"] || "",
    cloudinaryApiKey: process.env["CLOUDINARY_API_KEY"] || "",
    cloudinaryApiSecret: process.env["CLOUDINARY_API_SECRET"] || "",
    logLevel: process.env["LOG_LEVEL"] || "info",
};
const requiredEnvVars = ["JWT_SECRET", "PAYSTACK_SECRET_KEY"];
if (exports.config.nodeEnv === "production") {
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
}
exports.default = exports.config;
//# sourceMappingURL=config.js.map