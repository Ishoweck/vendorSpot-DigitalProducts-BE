import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getCategories,
  getCategoryById,
  createCategory,
} from "../controllers/categoryController";

const router: Router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", authenticate, authorize("ADMIN"), createCategory);

export default router;
