// routes/deletionRoutes.ts
import express from "express";
import {
  requestAccountDeletion,
  getAllDeletionRequests,
  handleDeletionRequest,
  submitDeletionForUser
} from "../controllers/DeletionController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/request", authenticate, requestAccountDeletion);
router.get("/", authenticate, getAllDeletionRequests);
router.post("/:requestId/handle", authenticate, handleDeletionRequest);
router.post("/admin-submit", authenticate, submitDeletionForUser);


export default router;
