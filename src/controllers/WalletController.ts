import { Request, Response, NextFunction } from "express";
import { Wallet } from "../models/Wallet";
import { Vendor } from "../models/Vendor";
import { asyncHandler, createError } from "../middleware/errorHandler";

export const getVendorWallet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) {
      return next(createError("Vendor profile not found", 404));
    }

    const wallet = await Wallet.findById(vendor.walletId).lean();
    if (!wallet) {
      return next(createError("Wallet not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  }
);
