"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadRateLimit = exports.logDownloadActivity = exports.accessFileWithToken = exports.validateDownloadToken = exports.generateDownloadToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Product_1 = require("@/models/Product");
const errorHandler_1 = require("@/middleware/errorHandler");
const downloadTokens = new Map();
const generateDownloadToken = (productId, orderId, userId, downloadCount = 0) => {
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    downloadTokens.set(token, {
        productId,
        orderId,
        userId,
        expiresAt,
        downloadCount,
    });
    setTimeout(() => {
        downloadTokens.delete(token);
    }, 15 * 60 * 1000);
    return token;
};
exports.generateDownloadToken = generateDownloadToken;
const validateDownloadToken = (token) => {
    const tokenData = downloadTokens.get(token);
    if (!tokenData || tokenData.expiresAt < new Date()) {
        downloadTokens.delete(token);
        return null;
    }
    return tokenData;
};
exports.validateDownloadToken = validateDownloadToken;
exports.accessFileWithToken = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { token } = req.params;
    if (!token) {
        return next((0, errorHandler_1.createError)("Token is required", 400));
    }
    const tokenData = (0, exports.validateDownloadToken)(token);
    if (!tokenData) {
        return next((0, errorHandler_1.createError)("Invalid or expired download token", 403));
    }
    const product = await Product_1.Product.findById(tokenData.productId);
    if (!product || !product.fileUrl) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    await (0, exports.logDownloadActivity)(tokenData.userId, tokenData.productId, tokenData.orderId, "COMPLETED", {
        token: token,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });
    res.redirect(product.fileUrl);
});
const logDownloadActivity = async (userId, productId, orderId, action, metadata) => {
    const logEntry = {
        userId,
        productId,
        orderId,
        action,
        timestamp: new Date(),
        metadata,
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
    };
    console.log("Download Activity:", logEntry);
};
exports.logDownloadActivity = logDownloadActivity;
const downloadRateLimit = (maxDownloads = 10, windowMs = 60000) => {
    const requests = new Map();
    return (req, res, next) => {
        const user = req.user;
        const key = `${user._id}`;
        const now = Date.now();
        if (!requests.has(key)) {
            requests.set(key, []);
        }
        const userRequests = requests.get(key);
        const validRequests = userRequests.filter((timestamp) => now - timestamp < windowMs);
        if (validRequests.length >= maxDownloads) {
            return next((0, errorHandler_1.createError)("Too many download requests. Please try again later.", 429));
        }
        validRequests.push(now);
        requests.set(key, validRequests);
        next();
    };
};
exports.downloadRateLimit = downloadRateLimit;
//# sourceMappingURL=downloadSecurityService.js.map