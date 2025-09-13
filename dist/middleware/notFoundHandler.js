"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const errorHandler_1 = require("./errorHandler");
const notFoundHandler = (req, res, next) => {
    const error = (0, errorHandler_1.createError)(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map