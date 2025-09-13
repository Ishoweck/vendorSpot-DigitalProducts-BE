import { Request, Response, NextFunction } from "express";
import { Withdrawal } from "../models/Withdrawal";
import { asyncHandler, createError } from "../middleware/errorHandler";

const generateWithdrawalReference = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WD-${random}-${timestamp.slice(-8)}`;
};

export const initializeWithdrawal = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { amount, bankAccount, bankName, gateway } = req.body;

    if (!amount || !bankAccount || !bankName || !gateway) {
      return next(createError("Missing required fields", 400));
    }

    // TODO: Check user balance before allowing withdrawal

    const reference = generateWithdrawalReference();

    const withdrawal = await Withdrawal.create({
      userId: user._id,
      reference,
      amount,
      currency: "NGN",
      gateway,
      withdrawalDetails: { bankAccount, bankName },
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal initialized",
      data: withdrawal,
    });
  }
);

export const getUserWithdrawals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Withdrawal.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);
