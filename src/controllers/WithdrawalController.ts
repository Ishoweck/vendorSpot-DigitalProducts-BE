import { Request, Response, NextFunction } from "express";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { Withdrawal } from "../models/Withdrawal";
import { User } from "../models/User";
import { Wallet, WalletTransactionType } from "../models/Wallet"; // Wallet model with embedded transactions
import { createNotification } from "./NotificationController";
// import { generateWithdrawalReference } from "../utils/helpers";

const generateWithdrawalReference = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WITDR-${random}-${timestamp.slice(-8)}`;
};


export const initializeWithdrawal = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { amount, bankAccount, bankName, gateway, accountName } = req.body;

    if (!amount || !bankAccount || !bankName || !gateway || !accountName) {
      return next(createError("Missing required fields", 400));
    }

    // Fetch user and wallet
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return next(createError("User not found", 404));
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      return next(createError("User wallet not found", 404));
    }

    // Check wallet balance
    if (wallet.availableBalance < amount) {
      return next(createError("Insufficient wallet balance", 400));
    }

    // Deduct amount from wallet balance
    wallet.availableBalance -= amount;

    // Generate withdrawal reference
    const reference = generateWithdrawalReference();

    // Create withdrawal record
    const withdrawal = await Withdrawal.create({
      userId: user._id,
      reference,
      amount,
      currency: "NGN",
      gateway,
      withdrawalDetails: { bankAccount, bankName, accountName },
      status: "PENDING",
    });

    // Create wallet transaction object (embedded in wallet.transactions)
    const walletTransaction = {
      type: "withdrawal", // or just "WITHDRAWAL" if enum is not used
      title: `Withdrawal Requested (${reference})`,
      description: `Withdrawal of NGN ${amount} via ${gateway}`,
      amount: -amount,
      timestamp: new Date(),
      isPositive: false,
      reference,           // Link to withdrawal reference
      metadata: {
        bankAccount,
        bankName,
        withdrawalId: withdrawal._id,
      },
    };

    wallet.transactions.push(walletTransaction);

    // Save wallet changes
    await wallet.save();

    // Notify user
    try {
      await createNotification({
        userId: user._id.toString(),
        type: "PAYMENT_PENDING",
        title: "Withdrawal Requested",
        message: `Your withdrawal of NGN ${amount} has been initiated and is pending processing.`,
        category: "PAYMENT",
        priority: "HIGH",
        channels: ["IN_APP"],
        data: {
          withdrawalId: withdrawal._id,
          amount,
          status: "PENDING",
        },
      });
    } catch (error) {
      console.error("Failed to create withdrawal notification:", error);
    }

    // Respond success
    res.status(201).json({
      success: true,
      message: "Withdrawal initialized",
      data: withdrawal,
    });
  }
);

