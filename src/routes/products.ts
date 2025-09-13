import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth";
import {
  getProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProductFile,
} from "../controllers/productController";
import {
  accessFileWithToken,
  downloadRateLimit,
} from "../services/downloadSecurityService";

const router: Router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadFields = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "preview", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

router.get("/", getProducts);
router.get(
  "/vendor",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  getVendorProducts
);
router.get(
  "/:productId/download",
  authenticate,
  downloadRateLimit(5, 60000),
  downloadProductFile
);
router.get("/download/:token", accessFileWithToken);
router.get("/:id", getProductById);
router.post(
  "/",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  uploadFields,
  createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  uploadFields,
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  deleteProduct
);

export default router;
