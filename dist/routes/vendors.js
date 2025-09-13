"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("@/middleware/auth");
const VendorController_1 = require("@/controllers/VendorController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadFields = upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "documents", maxCount: 10 },
]);
const logoAndBannerFields = upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]);
router.post("/profile", auth_1.authenticate, uploadFields, VendorController_1.createVendorProfile);
router.get("/profile", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), VendorController_1.getVendorProfile);
router.put("/profile", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), uploadFields, VendorController_1.updateVendorProfile);
router.get("/dashboard", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), VendorController_1.getVendorDashboard);
router.get("/sales", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), VendorController_1.getVendorSales);
router.get("/", VendorController_1.getAllVendors);
router.get("/:id", VendorController_1.getVendorById);
router.patch("/:id/verify", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), VendorController_1.verifyVendor);
exports.default = router;
//# sourceMappingURL=vendors.js.map