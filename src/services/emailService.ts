import { Resend } from "resend";
import { config } from "../config/config";
import { logger } from "../utils/logger";

class EmailService {
  private resend: Resend | null = null;
  private isResendEnabled: boolean = false;

  constructor() {
    if (config.resendApiKey) {
      this.resend = new Resend(config.resendApiKey);
      this.isResendEnabled = true;
      logger.info("Resend email service initialized");
    } else {
      logger.warn(
        "Resend API key not provided. Email service will use fallback method."
      );
    }
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
  }): Promise<{ success: boolean; data: any }> {
    try {
      if (this.isResendEnabled && this.resend) {
        const emailData: any = {
          from: options.from || config.emailFrom,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
        };

        if (options.html) {
          emailData.html = options.html;
        }

        if (options.text) {
          emailData.text = options.text;
        } else if (!options.html) {
          emailData.text = options.subject;
        }

        const result = await this.resend.emails.send(emailData);

        logger.info("Email sent successfully via Resend", {
          to: options.to,
          subject: options.subject,
          id: result.data?.id,
        });

        return { success: true, data: result.data };
      } else {
        logger.info("Email would be sent (Resend not configured)", {
          to: options.to,
          subject: options.subject,
          from: options.from || config.emailFrom,
          html: options.html?.substring(0, 100) + "...",
        });

        return { success: true, data: { id: "fallback-" + Date.now() } };
      }
    } catch (error) {
      logger.error("Failed to send email", {
        error: error instanceof Error ? error.message : "Unknown error",
        to: options.to,
        subject: options.subject,
      });

      throw new Error("Failed to send email");
    }
  }

  // Welcome email template
  async sendWelcomeEmail(to: string, firstName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D7195B;">Welcome to Vendorspot!</h1>
        <p>Hi ${firstName},</p>
        <p>Welcome to Nigeria's most trusted digital marketplace! We're excited to have you join our community.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse thousands of digital products</li>
          <li>Purchase from verified vendors</li>
          <li>Enjoy instant digital delivery</li>
          <li>Shop with confidence and security</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy shopping!</p>
        <p>The Vendorspot Team</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: "Welcome to Vendorspot Digital Marketplace!",
      html,
    });
  }

  // Email verification OTP template
  async sendVerificationOTPEmail(
    to: string,
    firstName: string,
    verificationOTP: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D7195B; margin: 0;">Vendorspot</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#24BE02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 style="color: #333; margin: 20px 0;">Account Verification</h2>
          <p style="color: #666; margin-bottom: 30px;">Hi ${firstName}, use this verification code to verify your email address:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #D7195B;">
            <h1 style="color: #D7195B; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">${verificationOTP}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 12px;">If you didn't create an account with us, please ignore this email.</p>
          <p style="color: #999; font-size: 12px;">The Vendorspot Team</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: "Your Vendorspot Verification Code",
      html,
    });
  }

  // Password reset template
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string
  ) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D7195B;">Reset Your Password</h1>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #D7195B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>The Vendorspot Team</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: "Reset Your Vendorspot Password",
      html,
    });
  }

  // Order confirmation template
  async sendOrderConfirmationEmail(
    to: string,
    firstName: string,
    orderDetails: any
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D7195B;">Order Confirmation</h1>
        <p>Hi ${firstName},</p>
        <p>Thank you for your purchase! Your order has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p><strong>Total:</strong> ₦${orderDetails.total.toLocaleString()}</p>
          <p><strong>Items:</strong> ${orderDetails.itemCount} item(s)</p>
        </div>
        <p>You can download your digital products from your account dashboard.</p>
        <p>Thank you for choosing Vendorspot!</p>
        <p>The Vendorspot Team</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html,
    });
  }

  // Notification email template
  async sendNotificationEmail(
    to: string,
    data: {
      title: string;
      message: string;
      userName: string;
    }
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D7195B; margin: 0;">Vendorspot</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">${data.title}</h2>
          <p style="color: #666; margin-bottom: 30px;">Hi ${data.userName},</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #444; margin: 0; line-height: 1.6;">${data.message}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${config.frontendUrl}/dashboard/notifications" 
               style="background-color: #D7195B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 12px;">You received this email because you have notifications enabled for your Vendorspot account.</p>
          <p style="color: #999; font-size: 12px;">The Vendorspot Team</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: data.title,
      html,
    });
  }
}

export const emailService = new EmailService();
