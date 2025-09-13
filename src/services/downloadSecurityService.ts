import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { Product } from "@/models/Product";
import { asyncHandler, createError } from "@/middleware/errorHandler";

export interface DownloadToken {
  productId: string;
  orderId: string;
  userId: string;
  expiresAt: Date;
  downloadCount: number;
}

const downloadTokens = new Map<string, DownloadToken>();

export const generateDownloadToken = (
  productId: string,
  orderId: string,
  userId: string,
  downloadCount: number = 0
): string => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  downloadTokens.set(token, {
    productId,
    orderId,
    userId,
    expiresAt,
    downloadCount,
  });

  setTimeout(
    () => {
      downloadTokens.delete(token);
    },
    15 * 60 * 1000
  );

  return token;
};

export const validateDownloadToken = (token: string): DownloadToken | null => {
  const tokenData = downloadTokens.get(token);

  if (!tokenData || tokenData.expiresAt < new Date()) {
    downloadTokens.delete(token);
    return null;
  }

  return tokenData;
};

export const accessFileWithToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    if (!token) {
      return next(createError("Token is required", 400));
    }

    const tokenData = validateDownloadToken(token);
    if (!tokenData) {
      return next(createError("Invalid or expired download token", 403));
    }

    const product = await Product.findById(tokenData.productId);
    if (!product || !product.fileUrl) {
      return next(createError("Product not found", 404));
    }

    await logDownloadActivity(
      tokenData.userId,
      tokenData.productId,
      tokenData.orderId,
      "COMPLETED",
      {
        token: token,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      }
    );

    res.redirect(product.fileUrl);
  }
);

export const logDownloadActivity = async (
  userId: string,
  productId: string,
  orderId: string,
  action: "INITIATED" | "COMPLETED" | "FAILED",
  metadata?: any
) => {
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

export const downloadRateLimit = (
  maxDownloads: number = 10,
  windowMs: number = 60000
) => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const key = `${user._id}`;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key)!;

    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validRequests.length >= maxDownloads) {
      return next(
        createError("Too many download requests. Please try again later.", 429)
      );
    }

    validRequests.push(now);
    requests.set(key, validRequests);

    next();
  };
};
