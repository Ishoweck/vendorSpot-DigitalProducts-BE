export declare const cloudinaryService: {
    uploadFile: (file: Express.Multer.File, folder?: string, resourceType?: "image" | "raw" | "auto") => Promise<{
        url: string;
        publicId: string;
    }>;
    deleteFile: (publicId: string) => Promise<void>;
    extractPublicId: (url: string) => string | null;
    deleteMultipleFiles: (urls: string[]) => Promise<void>;
};
//# sourceMappingURL=cloudinaryService.d.ts.map