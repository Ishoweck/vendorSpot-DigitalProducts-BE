import { Request, Response, NextFunction } from "express";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { SocketService } from "../services/SocketService";
import { emailService } from "../services/emailService";

export const createNotification = async (data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  category: string;
  priority?: string;
  channels?: string[];
  data?: any;
  expiresAt?: Date;
}) => {
  try {
    console.log("This is useridd", data.userId);
    
    const user = await User.findById(data.userId);
    if (!user) return null;

    const isVendor = user.role === "VENDOR";
    const maxNotifications = isVendor ? 300 : 100;
    
    const existingNotifications = await Notification.countDocuments({
      userId: data.userId,
    });

    if (existingNotifications >= maxNotifications) {
      const oldestReadNotifications = await Notification.find({
        userId: data.userId,
        isRead: true,
      })
        .sort({ createdAt: 1 })
        .limit(existingNotifications - maxNotifications + 1);

      for (const notification of oldestReadNotifications) {
        await Notification.findByIdAndDelete(notification._id);
      }
    }

    let finalExpiresAt = data.expiresAt;
    if (data.category === "PROMOTION" || data.category === "SYSTEM") {
      if (!finalExpiresAt) {
        const expiryDays = data.category === "PROMOTION" ? 30 : 60;
        finalExpiresAt = new Date(
          Date.now() + expiryDays * 24 * 60 * 60 * 1000
        );
      }
    }

    const notification = await Notification.create({
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
        const io = SocketService.getIO();
        io.to(data.userId).emit("notification:new", notification);
      } catch (error) {
        console.log("Socket emit error:", error);
      }
    }

    if (data.channels?.includes("EMAIL") && user.isEmailVerified) {
      try {
        await emailService.sendNotificationEmail(user.email, {
          title: data.title,
          message: data.message,
          userName: `${user.firstName} ${user.lastName}`,
        });
        notification.emailSent = true;
        await notification.save();
      } catch (error) {
        console.error("Email notification error:", error);
      }
    }

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

export const getUserNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = { userId: user._id };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === "true";
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
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
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!notification) {
      return next(createError("Notification not found", 404));
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
  }
);

export const markAllNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    await Notification.updateMany(
      { userId: user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  }
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!notification) {
      return next(createError("Notification not found", 404));
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  }
);

export const clearAllNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    await Notification.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  }
);

export const getNotificationSettings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

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
  }
);

export const updateNotificationSettings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { settings } = req.body;

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: settings,
    });
  }
);

export const sendBulkNotification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { userIds, type, title, message, category, priority, channels } =
      req.body;

    if (user.role !== "ADMIN") {
      return next(createError("Unauthorized", 403));
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(createError("User IDs are required", 400));
    }

    if (!title || !message) {
      return next(createError("Title and message are required", 400));
    }

    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotification({
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
  }
);
