import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: mongoose.Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    image: String,
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

export const Category = mongoose.model<ICategory>("Category", categorySchema);
