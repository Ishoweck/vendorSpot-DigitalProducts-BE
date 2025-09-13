import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderByPaymentReference,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/OrderController";

const router: Router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);
router.get("/vendor", authenticate, authorize("VENDOR", "ADMIN"), getVendorOrders);
router.get("/payment/:reference", getOrderByPaymentReference);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id/status", authenticate, authorize("VENDOR", "ADMIN"), updateOrderStatus);
router.patch("/:id/cancel", authenticate, cancelOrder);

export default router;