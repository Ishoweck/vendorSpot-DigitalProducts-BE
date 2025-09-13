import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import hpp from "hpp";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "@/config/config";
import { logger } from "@/utils/logger";
import { errorHandler } from "@/middleware/errorHandler";
import { notFoundHandler } from "@/middleware/notFoundHandler";
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/users";
import vendorRoutes from "@/routes/vendors";
import adminRoutes from "@/routes/admin";
import productRoutes from "@/routes/products";
import categoryRoutes from "@/routes/categories";
import orderRoutes from "@/routes/orders";
import paymentRoutes from "@/routes/payments";
import reviewRoutes from "@/routes/reviews";
import notificationRoutes from "@/routes/notifications";
import webhookRoutes from "@/routes/webhooks";
import { SocketService } from "@/services/SocketService";
import walletRoutes from "@/routes/wallet";


dotenv.config();

class App {
  public app: express.Application;
  public server: any;
  public io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.corsOrigins,
        methods: ["GET", "POST"],
      },
    });

    this.connectDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeServices();
  }

  private async connectDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.mongodbUri);
      logger.info("✅ MongoDB connected successfully");
    } catch (error) {
      logger.error("❌ MongoDB connection failed:", error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Security middleware with CSP for production
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })
    );

    this.app.use(
      cors({
        origin: config.corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });

    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 50,
      delayMs: () => 500,
      validate: { delayMs: false },
    });

    this.app.use("/api/", limiter);
    this.app.use("/api/", speedLimiter);

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    this.app.use(compression());

    if (config.nodeEnv !== "test") {
      this.app.use(
        morgan("combined", {
          stream: {
            write: (message: string) => logger.info(message.trim()),
          },
        })
      );
    }

    this.app.use(hpp());

    this.app.set("trust proxy", 1);
  }

  private initializeRoutes(): void {
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
      });
    });

    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/vendors", vendorRoutes);
    this.app.use("/api/admin", adminRoutes);
    this.app.use("/api/products", productRoutes);
    this.app.use("/api/categories", categoryRoutes);
    this.app.use("/api/orders", orderRoutes);
    this.app.use("/api/notifications", notificationRoutes);
    this.app.use("/api/payments", paymentRoutes);
    this.app.use("/api/reviews", reviewRoutes);
    this.app.use("/api/webhooks", webhookRoutes);
    this.app.use("/api/wallet", walletRoutes);

  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      SocketService.initialize(this.io);
      logger.info("Socket.IO initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize services:", error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      const port = config.port;

      this.server.listen(port, () => {
        logger.info(
          `🚀 Server running on port ${port} in ${config.nodeEnv} mode`
        );
        logger.info(`Health Check: http://localhost:${port}/health`);
      });

      process.on("SIGTERM", () => {
        logger.info("SIGTERM received, shutting down gracefully");
        this.server.close(() => {
          mongoose.connection.close().then(() => {
            logger.info("MongoDB connection closed");
            process.exit(0);
          });
        });
      });

      process.on("SIGINT", () => {
        logger.info("SIGINT received, shutting down gracefully");
        this.server.close(() => {
          mongoose.connection.close().then(() => {
            logger.info("MongoDB connection closed");
            process.exit(0);
          });
        });
      });
    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  }
}

const app = new App();
app.start();

export default app;
