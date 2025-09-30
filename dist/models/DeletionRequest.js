"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletionRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DeletionRequestSchema = new mongoose_1.default.Schema({
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        refPath: "accountType",
    },
    accountType: {
        type: String,
        enum: ["User", "Vendor"],
        required: true,
    },
    requestedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    submittedByAdmin: {
        type: Boolean,
        default: false,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "DELETED"],
        default: "PENDING",
    },
    decisionReason: {
        type: String,
    },
    decidedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    decidedAt: {
        type: Date,
    },
    deletedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
exports.DeletionRequest = mongoose_1.default.model("DeletionRequest", DeletionRequestSchema);
//# sourceMappingURL=DeletionRequest.js.map