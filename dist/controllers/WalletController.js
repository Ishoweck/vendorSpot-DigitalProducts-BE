"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorWallet = void 0;
const Wallet_1 = require("../models/Wallet");
const Vendor_1 = require("../models/Vendor");
const errorHandler_1 = require("../middleware/errorHandler");
exports.getVendorWallet = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor profile not found", 404));
    }
    const wallet = await Wallet_1.Wallet.findById(vendor.walletId).lean();
    if (!wallet) {
        return next((0, errorHandler_1.createError)("Wallet not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Wallet retrieved successfully",
        data: wallet,
    });
});
//# sourceMappingURL=WalletController.js.map