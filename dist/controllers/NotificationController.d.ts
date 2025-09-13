import { Request, Response, NextFunction } from "express";
export declare const createNotification: (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    category: string;
    priority?: string;
    channels?: string[];
    data?: any;
    expiresAt?: Date;
}) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Notification").INotification, {}, {}> & import("../models/Notification").INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getUserNotifications: (req: Request, res: Response, next: NextFunction) => void;
export declare const markNotificationAsRead: (req: Request, res: Response, next: NextFunction) => void;
export declare const markAllNotificationsAsRead: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteNotification: (req: Request, res: Response, next: NextFunction) => void;
export declare const clearAllNotifications: (req: Request, res: Response, next: NextFunction) => void;
export declare const getNotificationSettings: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateNotificationSettings: (req: Request, res: Response, next: NextFunction) => void;
export declare const sendBulkNotification: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=NotificationController.d.ts.map