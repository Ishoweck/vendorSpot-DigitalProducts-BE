"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const NotificationController_1 = require("../controllers/NotificationController");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, NotificationController_1.getUserNotifications);
router.patch("/:id/read", auth_1.authenticate, NotificationController_1.markNotificationAsRead);
router.patch("/read-all", auth_1.authenticate, NotificationController_1.markAllNotificationsAsRead);
router.delete("/:id", auth_1.authenticate, NotificationController_1.deleteNotification);
router.delete("/clear-all", auth_1.authenticate, NotificationController_1.clearAllNotifications);
router.get("/settings", auth_1.authenticate, NotificationController_1.getNotificationSettings);
router.put("/settings", auth_1.authenticate, NotificationController_1.updateNotificationSettings);
router.post("/bulk", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), NotificationController_1.sendBulkNotification);
exports.default = router;
//# sourceMappingURL=notifications.js.map