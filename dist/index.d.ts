import 'module-alias/register';
import "reflect-metadata";
import "express-async-errors";
import express from "express";
import { Server } from "socket.io";
declare class App {
    app: express.Application;
    server: any;
    io: Server;
    constructor();
    private connectDatabase;
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    private initializeServices;
    start(): Promise<void>;
}
declare const app: App;
export default app;
//# sourceMappingURL=index.d.ts.map