import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import {
  initializePayment,
  verifyPayment,
  getUserPayments,
  refundPayment,
} from "@/controllers/PaymentController";

const router: Router = Router();

router.post("/initialize", authenticate, initializePayment);
router.post("/verify", authenticate, verifyPayment);
router.get("/", authenticate, getUserPayments);
router.post("/:id/refund", authenticate, refundPayment);

export default router;
