import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";
import { config } from "../config/config";

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  logger.error("Error occurred:", {
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

  if (error.name === "MongoServerError" && (error as any).code === 11000) {
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
    ...(config.nodeEnv === "development" && {
      stack: error.stack,
      error: error,
    }),
  });
};

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
