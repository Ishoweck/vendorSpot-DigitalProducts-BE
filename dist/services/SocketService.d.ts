import { Server } from "socket.io";
declare class SocketService {
    private static io;
    static initialize(io: Server): void;
    static getIO(): Server;
}
export { SocketService };
//# sourceMappingURL=SocketService.d.ts.map