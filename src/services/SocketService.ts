import { Server } from "socket.io";
import { logger } from "@/utils/logger";

class SocketService {
  private static io: Server;

  static initialize(io: Server): void {
    this.io = io;

    io.on("connection", (socket) => {
      logger.info("User connected:", socket.id);

      socket.on("disconnect", () => {
        logger.info("User disconnected:", socket.id);
      });
    });
  }

  static getIO(): Server {
    return this.io;
  }
}

export { SocketService };
