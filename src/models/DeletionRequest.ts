import mongoose from "mongoose";

const DeletionRequestSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "accountType",
    },
    accountType: {
      type: String,
      enum: ["User", "Vendor"],
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The person requesting deletion (usually same as accountId)
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
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

export const DeletionRequest = mongoose.model("DeletionRequest", DeletionRequestSchema);
