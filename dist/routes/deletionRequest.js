"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DeletionController_1 = require("../controllers/DeletionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/request", auth_1.authenticate, DeletionController_1.requestAccountDeletion);
router.get("/", auth_1.authenticate, DeletionController_1.getAllDeletionRequests);
router.post("/:requestId/handle", auth_1.authenticate, DeletionController_1.handleDeletionRequest);
router.post("/admin-submit", auth_1.authenticate, DeletionController_1.submitDeletionForUser);
exports.default = router;
//# sourceMappingURL=deletionRequest.js.map