import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth";
import {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorSales,
  getAllVendors,
  getVendorById,
  verifyVendor,
  getVendorByBusinessName,
} from "../controllers/VendorController";

const router: Router = Router();

const upload = multer({
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

router.post("/profile", authenticate, uploadFields, createVendorProfile);
router.get(
  "/profile",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  getVendorProfile
);
router.put(
  "/profile",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  uploadFields,
  updateVendorProfile
);
router.get(
  "/dashboard",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  getVendorDashboard
);
router.get(
  "/sales",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  getVendorSales
);
router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.patch("/:id/verify", authenticate, authorize("ADMIN"), verifyVendor);
router.get("/getVendorDetails/:businessName", getVendorByBusinessName);


export default router;
