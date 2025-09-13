import { Router } from "express";
import multer from "multer";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  respondToReview,
  markReviewHelpful,
  reportReview,
} from "../controllers/ReviewController";

const router: Router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/", authenticate, upload.array("images", 5), createReview);
router.get("/product/:productId", optionalAuth, getProductReviews);
router.get("/user", authenticate, getUserReviews);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);
router.post(
  "/:id/respond",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  respondToReview
);
router.post("/:id/helpful", authenticate, markReviewHelpful);
router.post("/:id/report", authenticate, reportReview);

export default router;
