import { Request, Response, NextFunction } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => void;
export declare const login: (req: Request, res: Response, next: NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: NextFunction) => void;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyEmailOTP: (req: Request, res: Response, next: NextFunction) => void;
export declare const resendVerificationOTP: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authController.d.ts.map