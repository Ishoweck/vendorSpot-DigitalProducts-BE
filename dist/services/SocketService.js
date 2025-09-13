"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const logger_1 = require("../utils/logger");
class SocketService {
    static io;
    static initialize(io) {
        this.io = io;
        io.on("connection", (socket) => {
            logger_1.logger.info("User connected:", socket.id);
            socket.on("disconnect", () => {
                logger_1.logger.info("User disconnected:", socket.id);
            });
        });
    }
    static getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=SocketService.js.map