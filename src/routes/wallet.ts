import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getVendorWallet } from "../controllers/WalletController";

const router: Router = Router();

router.get("/getMyWallet", authenticate, getVendorWallet);

export default router;
