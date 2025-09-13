import { Router } from "express";
import { authenticate, authorize } from "@/middleware/auth";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  sendBulkNotification
} from "@/controllers/NotificationController";

const router: Router = Router();

router.get("/", authenticate, getUserNotifications);
router.patch("/:id/read", authenticate, markNotificationAsRead);
router.patch("/read-all", authenticate, markAllNotificationsAsRead);
router.delete("/:id", authenticate, deleteNotification);
router.delete("/clear-all", authenticate, clearAllNotifications);
router.get("/settings", authenticate, getNotificationSettings);
router.put("/settings", authenticate, updateNotificationSettings);
router.post("/bulk", authenticate, authorize("ADMIN"), sendBulkNotification);

export default router;