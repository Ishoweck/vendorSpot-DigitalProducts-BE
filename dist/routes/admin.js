"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Admincontrollers = __importStar(require("../controllers/AdminController"));
const router = (0, express_1.Router)();
router.get("/users", Admincontrollers.getAllUsers);
router.get("/users/:id", Admincontrollers.getUserById);
router.get("/vendors", Admincontrollers.getAllVendors);
router.get("/vendors/:id", Admincontrollers.getVendorById);
router.patch("/vendors/:vendorId/verification", Admincontrollers.updateVendorVerification);
router.get("/wallet", Admincontrollers.getWalletByUserId);
router.get("/wallet/:userId", Admincontrollers.getWalletDetails);
router.get("/reviews/moderation", Admincontrollers.getReviewsForModeration);
router.patch("/reviews/:reviewId/moderate", Admincontrollers.moderateReview);
router.get("/products", Admincontrollers.getProducts);
router.get("/products/:productId", Admincontrollers.getProductById);
router.patch("/products/:productId/approval", Admincontrollers.updateProductApproval);
router.patch("/products/:productId/status", Admincontrollers.updateProductStatus);
router.get("/payments", Admincontrollers.getPayments);
router.get("/payments/:paymentId", Admincontrollers.getPaymentById);
router.patch("/payments/:paymentId/status", Admincontrollers.updatePaymentStatus);
router.get("/orders", Admincontrollers.getOrders);
router.get("/orders/:orderId", Admincontrollers.getOrderById);
router.patch("/orders/:orderId/status", Admincontrollers.updateOrderStatus);
router.post("/categories", Admincontrollers.createCategory);
router.get("/categories", Admincontrollers.getCategories);
router.get("/categories/:id", Admincontrollers.getCategoryById);
router.patch("/categories/:id", Admincontrollers.updateCategory);
router.delete("/categories/:id", Admincontrollers.deleteCategory);
exports.default = router;
//# sourceMappingURL=admin.js.map