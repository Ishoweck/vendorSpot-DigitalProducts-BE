import { Router } from "express";
import { paystackWebhook } from "../controllers/WebhookController";

const router: Router = Router();

router.post("/paystack", paystackWebhook);

export default router;