"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.isAdmin = exports.isVendor = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const config_1 = require("../config/config");
const errorHandler_1 = require("./errorHandler");
exports.authenticate = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next((0, errorHandler_1.createError)("Access denied. No token provided", 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.id).select("-password");
        if (!user) {
            return next((0, errorHandler_1.createError)("User not found", 401));
        }
        if (user.status !== "ACTIVE") {
            return next((0, errorHandler_1.createError)("Account is not active", 401));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return next((0, errorHandler_1.createError)("Invalid token", 401));
    }
});
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log("This is it", req.user);
        if (!req.user) {
            return next((0, errorHandler_1.createError)("Access denied. Please login", 401));
        }
        if (!roles.includes(req.user.role)) {
            return next((0, errorHandler_1.createError)("Access denied. Insufficient permissions", 403));
        }
        next();
    };
};
exports.authorize = authorize;
exports.isVendor = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    if (!req.user) {
        return next((0, errorHandler_1.createError)("Access denied. Please login", 401));
    }
    if (req.user.role !== "VENDOR" && req.user.role !== "ADMIN") {
        return next((0, errorHandler_1.createError)("Access denied. Vendor access required", 403));
    }
    next();
});
exports.isAdmin = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    if (!req.user) {
        return next((0, errorHandler_1.createError)("Access denied. Please login", 401));
    }
    if (req.user.role !== "ADMIN") {
        return next((0, errorHandler_1.createError)("Access denied. Admin access required", 403));
    }
    next();
});
exports.optionalAuth = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            const user = await User_1.User.findById(decoded.id).select("-password");
            if (user && user.status === "ACTIVE") {
                req.user = user;
            }
        }
        catch (error) {
        }
    }
    next();
});
//# sourceMappingURL=auth.js.map