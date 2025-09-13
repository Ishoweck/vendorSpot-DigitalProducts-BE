"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("@/middleware/auth");
const productController_1 = require("@/controllers/productController");
const downloadSecurityService_1 = require("@/services/downloadSecurityService");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadFields = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
    { name: "preview", maxCount: 1 },
    { name: "images", maxCount: 5 },
]);
router.get("/", productController_1.getProducts);
router.get("/vendor", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), productController_1.getVendorProducts);
router.get("/:productId/download", auth_1.authenticate, (0, downloadSecurityService_1.downloadRateLimit)(5, 60000), productController_1.downloadProductFile);
router.get("/download/:token", downloadSecurityService_1.accessFileWithToken);
router.get("/:id", productController_1.getProductById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), uploadFields, productController_1.createProduct);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), uploadFields, productController_1.updateProduct);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map