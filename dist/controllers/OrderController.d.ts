import { Request, Response, NextFunction } from "express";
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => void;
export declare const getUserOrders: (req: Request, res: Response, next: NextFunction) => void;
export declare const getOrderById: (req: Request, res: Response, next: NextFunction) => void;
export declare const getOrderByPaymentReference: (req: Request, res: Response, next: NextFunction) => void;
export declare const getVendorOrders: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateOrderStatus: (req: Request, res: Response, next: NextFunction) => void;
export declare const cancelOrder: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=OrderController.d.ts.map