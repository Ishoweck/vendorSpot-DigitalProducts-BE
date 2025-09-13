"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const config_1 = require("../config/config");
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    logger_1.logger.error("Error occurred:", {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });
    if (error.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }
    if (error.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(config_1.config.nodeEnv === "development" && {
            stack: error.stack,
            error: error,
        }),
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map