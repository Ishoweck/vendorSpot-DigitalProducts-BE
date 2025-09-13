import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const isVendor: (req: Request, res: Response, next: NextFunction) => void;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map