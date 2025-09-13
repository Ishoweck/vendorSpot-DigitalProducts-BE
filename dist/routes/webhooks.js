"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WebhookController_1 = require("@/controllers/WebhookController");
const router = (0, express_1.Router)();
router.post("/paystack", WebhookController_1.paystackWebhook);
exports.default = router;
//# sourceMappingURL=webhooks.js.map