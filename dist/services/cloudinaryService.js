"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.cloudinaryService = {
    uploadFile: async (file, folder = "products", resourceType = "auto") => {
        try {
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                folder: `vendorspot/${folder}`,
                resource_type: resourceType,
                use_filename: true,
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        catch (error) {
            console.error(error);
            throw new Error("File upload failed");
        }
    },
    deleteFile: async (publicId) => {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (error) {
            console.error("Failed to delete file from Cloudinary:", error);
        }
    },
    extractPublicId: (url) => {
        try {
            const urlParts = url.split("/");
            const uploadIndex = urlParts.findIndex((part) => part === "upload");
            if (uploadIndex === -1)
                return null;
            const pathAfterUpload = urlParts.slice(uploadIndex + 1);
            if (pathAfterUpload[0] && pathAfterUpload[0].startsWith("v")) {
                pathAfterUpload.shift();
            }
            const publicIdWithExt = pathAfterUpload.join("/");
            const lastDotIndex = publicIdWithExt.lastIndexOf(".");
            return lastDotIndex > 0
                ? publicIdWithExt.substring(0, lastDotIndex)
                : publicIdWithExt;
        }
        catch (error) {
            console.error("Failed to extract public ID from URL:", error);
            return null;
        }
    },
    deleteMultipleFiles: async (urls) => {
        const deletePromises = urls.map(async (url) => {
            const publicId = exports.cloudinaryService.extractPublicId(url);
            if (publicId) {
                await exports.cloudinaryService.deleteFile(publicId);
            }
        });
        await Promise.allSettled(deletePromises);
    },
};
//# sourceMappingURL=cloudinaryService.js.map