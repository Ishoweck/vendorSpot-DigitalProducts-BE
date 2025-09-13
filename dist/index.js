"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
require("reflect-metadata");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const hpp_1 = __importDefault(require("hpp"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./config/config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const vendors_1 = __importDefault(require("./routes/vendors"));
const admin_1 = __importDefault(require("./routes/admin"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const orders_1 = __importDefault(require("./routes/orders"));
const payments_1 = __importDefault(require("./routes/payments"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const SocketService_1 = require("./services/SocketService");
const wallet_1 = __importDefault(require("./routes/wallet"));
dotenv_1.default.config();
class App {
    app;
    server;
    io;
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: config_1.config.corsOrigins,
                methods: ["GET", "POST"],
            },
        });
        this.connectDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeServices();
    }
    async connectDatabase() {
        try {
            await mongoose_1.default.connect(config_1.config.mongodbUri);
            logger_1.logger.info("✅ MongoDB connected successfully");
        }
        catch (error) {
            logger_1.logger.error("❌ MongoDB connection failed:", error);
            process.exit(1);
        }
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: config_1.config.corsOrigins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: "Too many requests from this IP, please try again later.",
            standardHeaders: true,
            legacyHeaders: false,
        });
        const speedLimiter = (0, express_slow_down_1.default)({
            windowMs: 15 * 60 * 1000,
            delayAfter: 50,
            delayMs: () => 500,
            validate: { delayMs: false },
        });
        this.app.use("/api/", limiter);
        this.app.use("/api/", speedLimiter);
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        this.app.use((0, compression_1.default)());
        if (config_1.config.nodeEnv !== "test") {
            this.app.use((0, morgan_1.default)("combined", {
                stream: {
                    write: (message) => logger_1.logger.info(message.trim()),
                },
            }));
        }
        this.app.use((0, hpp_1.default)());
        this.app.set("trust proxy", 1);
    }
    initializeRoutes() {
        this.app.get("/health", (req, res) => {
            res.status(200).json({
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: config_1.config.nodeEnv,
            });
        });
        this.app.use("/api/auth", auth_1.default);
        this.app.use("/api/users", users_1.default);
        this.app.use("/api/vendors", vendors_1.default);
        this.app.use("/api/admin", admin_1.default);
        this.app.use("/api/products", products_1.default);
        this.app.use("/api/categories", categories_1.default);
        this.app.use("/api/orders", orders_1.default);
        this.app.use("/api/notifications", notifications_1.default);
        this.app.use("/api/payments", payments_1.default);
        this.app.use("/api/reviews", reviews_1.default);
        this.app.use("/api/webhooks", webhooks_1.default);
        this.app.use("/api/wallet", wallet_1.default);
    }
    initializeErrorHandling() {
        this.app.use(notFoundHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
    }
    async initializeServices() {
        try {
            SocketService_1.SocketService.initialize(this.io);
            logger_1.logger.info("Socket.IO initialized successfully");
        }
        catch (error) {
            logger_1.logger.error("Failed to initialize services:", error);
            process.exit(1);
        }
    }
    async start() {
        try {
            const port = config_1.config.port;
            this.server.listen(port, () => {
                logger_1.logger.info(`🚀 Server running on port ${port} in ${config_1.config.nodeEnv} mode`);
                logger_1.logger.info(`Health Check: http://localhost:${port}/health`);
            });
            process.on("SIGTERM", () => {
                logger_1.logger.info("SIGTERM received, shutting down gracefully");
                this.server.close(() => {
                    mongoose_1.default.connection.close().then(() => {
                        logger_1.logger.info("MongoDB connection closed");
                        process.exit(0);
                    });
                });
            });
            process.on("SIGINT", () => {
                logger_1.logger.info("SIGINT received, shutting down gracefully");
                this.server.close(() => {
                    mongoose_1.default.connection.close().then(() => {
                        logger_1.logger.info("MongoDB connection closed");
                        process.exit(0);
                    });
                });
            });
        }
        catch (error) {
            logger_1.logger.error("Failed to start server:", error);
            process.exit(1);
        }
    }
}
const app = new App();
app.start();
exports.default = app;
//# sourceMappingURL=index.js.map