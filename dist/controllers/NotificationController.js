"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkNotification = exports.updateNotificationSettings = exports.getNotificationSettings = exports.clearAllNotifications = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const Notification_1 = require("@/models/Notification");
const User_1 = require("@/models/User");
const errorHandler_1 = require("@/middleware/errorHandler");
const SocketService_1 = require("@/services/SocketService");
const emailService_1 = require("@/services/emailService");
const createNotification = async (data) => {
    try {
        const user = await User_1.User.findById(data.userId);
        if (!user)
            return null;
        const isVendor = user.role === "VENDOR";
        const maxNotifications = isVendor ? 300 : 100;
        const existingNotifications = await Notification_1.Notification.countDocuments({
            userId: data.userId,
        });
        if (existingNotifications >= maxNotifications) {
            const oldestReadNotifications = await Notification_1.Notification.find({
                userId: data.userId,
                isRead: true,
            })
                .sort({ createdAt: 1 })
                .limit(existingNotifications - maxNotifications + 1);
            for (const notification of oldestReadNotifications) {
                await Notification_1.Notification.findByIdAndDelete(notification._id);
            }
        }
        let finalExpiresAt = data.expiresAt;
        if (data.category === "PROMOTION" || data.category === "SYSTEM") {
            if (!finalExpiresAt) {
                const expiryDays = data.category === "PROMOTION" ? 30 : 60;
                finalExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
            }
        }
        const notification = await Notification_1.Notification.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            category: data.category,
            priority: data.priority || "NORMAL",
            channels: data.channels || ["IN_APP"],
            data: data.data,
            expiresAt: finalExpiresAt,
        });
        if (data.channels?.includes("IN_APP")) {
            try {
                const io = SocketService_1.SocketService.getIO();
                io.to(data.userId).emit("notification:new", notification);
            }
            catch (error) {
                console.log("Socket emit error:", error);
            }
        }
        if (data.channels?.includes("EMAIL") && user.isEmailVerified) {
            try {
                await emailService_1.emailService.sendNotificationEmail(user.email, {
                    title: data.title,
                    message: data.message,
                    userName: `${user.firstName} ${user.lastName}`,
                });
                notification.emailSent = true;
                await notification.save();
            }
            catch (error) {
                console.error("Email notification error:", error);
            }
        }
        return notification;
    }
    catch (error) {
        console.error("Create notification error:", error);
        return null;
    }
};
exports.createNotification = createNotification;
exports.getUserNotifications = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const query = { userId: user._id };
    if (req.query.category) {
        query.category = req.query.category;
    }
    if (req.query.isRead !== undefined) {
        query.isRead = req.query.isRead === "true";
    }
    if (req.query.priority) {
        query.priority = req.query.priority;
    }
    const notifications = await Notification_1.Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Notification_1.Notification.countDocuments(query);
    const unreadCount = await Notification_1.Notification.countDocuments({
        userId: user._id,
        isRead: false,
    });
    res.status(200).json({
        success: true,
        data: {
            notifications,
            unreadCount,
        },
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.markNotificationAsRead = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const notification = await Notification_1.Notification.findOne({
        _id: req.params.id,
        userId: user._id,
    });
    if (!notification) {
        return next((0, errorHandler_1.createError)("Notification not found", 404));
    }
    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }
    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
    });
});
exports.markAllNotificationsAsRead = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    await Notification_1.Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
    });
});
exports.deleteNotification = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const notification = await Notification_1.Notification.findOne({
        _id: req.params.id,
        userId: user._id,
    });
    if (!notification) {
        return next((0, errorHandler_1.createError)("Notification not found", 404));
    }
    await Notification_1.Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
    });
});
exports.clearAllNotifications = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    await Notification_1.Notification.deleteMany({ userId: user._id });
    res.status(200).json({
        success: true,
        message: "All notifications cleared",
    });
});
exports.getNotificationSettings = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const settings = {
        email: {
            orderUpdates: true,
            paymentNotifications: true,
            productApproval: true,
            reviewNotifications: true,
            promotions: false,
        },
        push: {
            orderUpdates: true,
            paymentNotifications: true,
            productApproval: true,
            reviewNotifications: true,
            promotions: false,
        },
        sms: {
            orderUpdates: false,
            paymentNotifications: true,
            productApproval: false,
            reviewNotifications: false,
            promotions: false,
        },
    };
    res.status(200).json({
        success: true,
        data: settings,
    });
});
exports.updateNotificationSettings = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { settings } = req.body;
    res.status(200).json({
        success: true,
        message: "Notification settings updated successfully",
        data: settings,
    });
});
exports.sendBulkNotification = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { userIds, type, title, message, category, priority, channels } = req.body;
    if (user.role !== "ADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return next((0, errorHandler_1.createError)("User IDs are required", 400));
    }
    if (!title || !message) {
        return next((0, errorHandler_1.createError)("Title and message are required", 400));
    }
    const notifications = [];
    for (const userId of userIds) {
        const notification = await (0, exports.createNotification)({
            userId,
            type: type || "SYSTEM_ANNOUNCEMENT",
            title,
            message,
            category: category || "SYSTEM",
            priority: priority || "NORMAL",
            channels: channels || ["IN_APP", "EMAIL"],
        });
        if (notification) {
            notifications.push(notification);
        }
    }
    res.status(200).json({
        success: true,
        message: `Notifications sent to ${notifications.length} users`,
        data: { count: notifications.length },
    });
});
//# sourceMappingURL=NotificationController.js.map