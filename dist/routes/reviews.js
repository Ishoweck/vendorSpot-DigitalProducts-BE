"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const ReviewController_1 = require("../controllers/ReviewController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    },
});
router.post("/", auth_1.authenticate, upload.array("images", 5), ReviewController_1.createReview);
router.get("/product/:productId", auth_1.optionalAuth, ReviewController_1.getProductReviews);
router.get("/user", auth_1.authenticate, ReviewController_1.getUserReviews);
router.put("/:id", auth_1.authenticate, ReviewController_1.updateReview);
router.delete("/:id", auth_1.authenticate, ReviewController_1.deleteReview);
router.post("/:id/respond", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), ReviewController_1.respondToReview);
router.post("/:id/helpful", auth_1.authenticate, ReviewController_1.markReviewHelpful);
router.post("/:id/report", auth_1.authenticate, ReviewController_1.reportReview);
exports.default = router;
//# sourceMappingURL=reviews.js.map