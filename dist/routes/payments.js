"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const PaymentController_1 = require("../controllers/PaymentController");
const router = (0, express_1.Router)();
router.post("/initialize", auth_1.authenticate, PaymentController_1.initializePayment);
router.post("/verify", auth_1.authenticate, PaymentController_1.verifyPayment);
router.get("/", auth_1.authenticate, PaymentController_1.getUserPayments);
router.post("/:id/refund", auth_1.authenticate, PaymentController_1.refundPayment);
exports.default = router;
//# sourceMappingURL=payments.js.map