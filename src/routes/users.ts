import { Router } from "express";
import multer from "multer";
import { authenticate } from "@/middleware/auth";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserDashboard,
  getUserWishlist,
  deleteAccount,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/controllers/UserController";

const router: Router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.post("/change-password", authenticate, changePassword);
router.get("/dashboard", authenticate, getUserDashboard);
router.delete("/account", authenticate, deleteAccount);

router.get("/wishlist", authenticate, getUserWishlist);
router.post("/wishlist", authenticate, addToWishlist);
router.delete("/wishlist/:productId", authenticate, removeFromWishlist);

router.get("/cart", authenticate, getCart);
router.post("/cart", authenticate, addToCart);
router.put("/cart/:productId", authenticate, updateCartItem);
router.delete("/cart/:productId", authenticate, removeFromCart);
router.delete("/cart", authenticate, clearCart);

router.get("/addresses", authenticate, getAddresses);
router.post("/addresses", authenticate, addAddress);
router.put("/addresses/:id", authenticate, updateAddress);
router.delete("/addresses/:id", authenticate, deleteAddress);
router.patch("/addresses/:id/default", authenticate, setDefaultAddress);

export default router;