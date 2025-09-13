import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/config";
import { log } from "console";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  uploadFile: async (
    file: Express.Multer.File,
    folder: string = "products",
    resourceType: "image" | "raw" | "auto" = "auto"
  ) => {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `vendorspot/${folder}`,
        resource_type: resourceType,
        use_filename: true,
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error(error)
      throw new Error("File upload failed");
    }
  },

  deleteFile: async (publicId: string) => {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Failed to delete file from Cloudinary:", error);
    }
  },

  extractPublicId: (url: string): string | null => {
    try {
      const urlParts = url.split("/");
      const uploadIndex = urlParts.findIndex((part) => part === "upload");
      if (uploadIndex === -1) return null;

      const pathAfterUpload = urlParts.slice(uploadIndex + 1);
      if (pathAfterUpload[0] && pathAfterUpload[0].startsWith("v")) {
        pathAfterUpload.shift();
      }

      const publicIdWithExt = pathAfterUpload.join("/");
      const lastDotIndex = publicIdWithExt.lastIndexOf(".");
      return lastDotIndex > 0
        ? publicIdWithExt.substring(0, lastDotIndex)
        : publicIdWithExt;
    } catch (error) {
      console.error("Failed to extract public ID from URL:", error);
      return null;
    }
  },

  deleteMultipleFiles: async (urls: string[]) => {
    const deletePromises = urls.map(async (url) => {
      const publicId = cloudinaryService.extractPublicId(url);
      if (publicId) {
        await cloudinaryService.deleteFile(publicId);
      }
    });

    await Promise.allSettled(deletePromises);
  },
};
