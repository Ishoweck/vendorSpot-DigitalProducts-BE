declare class EmailService {
    private resend;
    private isResendEnabled;
    constructor();
    sendEmail(options: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        from?: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    sendWelcomeEmail(to: string, firstName: string): Promise<{
        success: boolean;
        data: any;
    }>;
    sendVerificationOTPEmail(to: string, firstName: string, verificationOTP: string): Promise<{
        success: boolean;
        data: any;
    }>;
    sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<{
        success: boolean;
        data: any;
    }>;
    sendOrderConfirmationEmail(to: string, firstName: string, orderDetails: any): Promise<{
        success: boolean;
        data: any;
    }>;
    sendNotificationEmail(to: string, data: {
        title: string;
        message: string;
        userName: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map