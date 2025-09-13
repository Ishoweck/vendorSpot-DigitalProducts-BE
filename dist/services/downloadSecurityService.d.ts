import { Request, Response, NextFunction } from "express";
export interface DownloadToken {
    productId: string;
    orderId: string;
    userId: string;
    expiresAt: Date;
    downloadCount: number;
}
export declare const generateDownloadToken: (productId: string, orderId: string, userId: string, downloadCount?: number) => string;
export declare const validateDownloadToken: (token: string) => DownloadToken | null;
export declare const accessFileWithToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const logDownloadActivity: (userId: string, productId: string, orderId: string, action: "INITIATED" | "COMPLETED" | "FAILED", metadata?: any) => Promise<void>;
export declare const downloadRateLimit: (maxDownloads?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=downloadSecurityService.d.ts.map