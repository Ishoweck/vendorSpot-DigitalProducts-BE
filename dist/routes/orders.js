"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const OrderController_1 = require("@/controllers/OrderController");
const router = (0, express_1.Router)();
router.post("/", auth_1.authenticate, OrderController_1.createOrder);
router.get("/", auth_1.authenticate, OrderController_1.getUserOrders);
router.get("/vendor", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), OrderController_1.getVendorOrders);
router.get("/payment/:reference", OrderController_1.getOrderByPaymentReference);
router.get("/:id", auth_1.authenticate, OrderController_1.getOrderById);
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("VENDOR", "ADMIN"), OrderController_1.updateOrderStatus);
router.patch("/:id/cancel", auth_1.authenticate, OrderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map