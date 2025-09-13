"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const WalletController_1 = require("../controllers/WalletController");
const router = (0, express_1.Router)();
router.get("/getMyWallet", auth_1.authenticate, WalletController_1.getVendorWallet);
exports.default = router;
//# sourceMappingURL=wallet.js.map