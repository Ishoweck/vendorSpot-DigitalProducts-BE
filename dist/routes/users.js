"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.get("/profile", auth_1.authenticate, UserController_1.getProfile);
router.put("/profile", auth_1.authenticate, UserController_1.updateProfile);
router.post("/avatar", auth_1.authenticate, upload.single("avatar"), UserController_1.uploadAvatar);
router.post("/change-password", auth_1.authenticate, UserController_1.changePassword);
router.get("/dashboard", auth_1.authenticate, UserController_1.getUserDashboard);
router.delete("/account", auth_1.authenticate, UserController_1.deleteAccount);
router.get("/wishlist", auth_1.authenticate, UserController_1.getUserWishlist);
router.post("/wishlist", auth_1.authenticate, UserController_1.addToWishlist);
router.delete("/wishlist/:productId", auth_1.authenticate, UserController_1.removeFromWishlist);
router.get("/cart", auth_1.authenticate, UserController_1.getCart);
router.post("/cart", auth_1.authenticate, UserController_1.addToCart);
router.put("/cart/:productId", auth_1.authenticate, UserController_1.updateCartItem);
router.delete("/cart/:productId", auth_1.authenticate, UserController_1.removeFromCart);
router.delete("/cart", auth_1.authenticate, UserController_1.clearCart);
router.get("/addresses", auth_1.authenticate, UserController_1.getAddresses);
router.post("/addresses", auth_1.authenticate, UserController_1.addAddress);
router.put("/addresses/:id", auth_1.authenticate, UserController_1.updateAddress);
router.delete("/addresses/:id", auth_1.authenticate, UserController_1.deleteAddress);
router.patch("/addresses/:id/default", auth_1.authenticate, UserController_1.setDefaultAddress);
exports.default = router;
//# sourceMappingURL=users.js.map