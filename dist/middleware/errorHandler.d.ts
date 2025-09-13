import { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode: number) => AppError;
//# sourceMappingURL=errorHandler.d.ts.map