import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getVendorWallet } from "../controllers/WalletController";
import { initializeWithdrawal } from "@/controllers/WithdrawalController";
const router: Router = Router();

router.get("/getMyWallet", authenticate, getVendorWallet);
router.post("/withdraw", authenticate, initializeWithdrawal )    

export default router;
