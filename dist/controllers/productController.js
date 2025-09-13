"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadProductFile = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getVendorProducts = exports.getProductById = exports.getProducts = void 0;
const url_1 = require("url");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
const Product_1 = require("../models/Product");
const Review_1 = require("../models/Review");
const Vendor_1 = require("../models/Vendor");
const Order_1 = require("../models/Order");
const cloudinaryService_1 = require("../services/cloudinaryService");
const errorHandler_1 = require("../middleware/errorHandler");
const SocketService_1 = require("../services/SocketService");
const NotificationController_1 = require("./NotificationController");
const downloadSecurityService_1 = require("../services/downloadSecurityService");
exports.getProducts = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = { isActive: true, isApproved: true };
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: "i" } },
                { description: { $regex: req.query.search, $options: "i" } },
            ];
        }
        if (req.query.category) {
            query.categoryId = req.query.category;
        }
        if (req.query.vendor) {
            const vendors = await Vendor_1.Vendor.find({
                businessName: { $regex: req.query.vendor, $options: "i" },
            });
            if (vendors.length > 0) {
                query.vendorId = { $in: vendors.map((v) => v._id) };
            }
            else {
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                    },
                });
            }
        }
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = parseFloat(req.query.maxPrice);
            }
        }
        if (req.query.minRating) {
            query.rating = { $gte: parseFloat(req.query.minRating) };
        }
        let sortOptions = { createdAt: -1 };
        if (req.query.sortBy) {
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
            if (sortBy === "price") {
                sortOptions = { price: sortOrder };
            }
            else if (sortBy === "rating") {
                sortOptions = { rating: sortOrder };
            }
            else if (sortBy === "soldCount") {
                sortOptions = { soldCount: sortOrder };
            }
            else if (sortBy === "createdAt") {
                sortOptions = { createdAt: sortOrder };
            }
        }
        const products = await Product_1.Product.find(query)
            .populate("vendorId", "businessName")
            .populate("categoryId", "name")
            .select("-fileUrl")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        const productIds = products.map((p) => p._id);
        const reviewStats = await Review_1.Review.aggregate([
            { $match: { productId: { $in: productIds }, status: "APPROVED" } },
            {
                $group: {
                    _id: "$productId",
                    average: { $avg: "$rating" },
                    total: { $sum: 1 },
                },
            },
        ]);
        const idToStats = new Map(reviewStats.map((s) => [
            s._id.toString(),
            { average: Math.round((s.average || 0) * 10) / 10, total: s.total },
        ]));
        const productsWithLive = products.map((p) => {
            const stats = idToStats.get(p._id.toString());
            const obj = p.toObject();
            return {
                ...obj,
                rating: stats ? stats.average : obj.rating,
                reviewCount: stats ? stats.total : obj.reviewCount,
            };
        });
        const total = await Product_1.Product.countDocuments(query);
        return res.status(200).json({
            success: true,
            data: productsWithLive,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.getProductById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product_1.Product.findById(id)
        .populate("vendorId", "businessName")
        .populate("categoryId", "name")
        .select("-fileUrl");
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    await Product_1.Product.findByIdAndUpdate(id, {
        $inc: { viewCount: 1 },
    });
    const liveStats = await Review_1.Review.aggregate([
        {
            $match: {
                productId: new mongoose_1.default.Types.ObjectId(id),
                status: "APPROVED",
            },
        },
        {
            $group: {
                _id: null,
                average: { $avg: "$rating" },
                total: { $sum: 1 },
            },
        },
    ]);
    const average = liveStats[0]?.average
        ? Math.round(liveStats[0].average * 10) / 10
        : 0;
    const totalReviews = liveStats[0]?.total || 0;
    await Product_1.Product.findByIdAndUpdate(id, {
        $set: {
            rating: average,
            reviewCount: totalReviews,
        },
    });
    res.status(200).json({
        success: true,
        data: {
            ...product.toObject(),
            rating: average,
            reviewCount: totalReviews,
        },
    });
});
exports.getVendorProducts = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const products = await Product_1.Product.find({ vendorId: vendor._id })
        .populate("categoryId", "name")
        .select("-fileUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Product_1.Product.countDocuments({ vendorId: vendor._id });
    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.createProduct = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const { name, description, price, originalPrice, discountPercentage, categoryId, tags, features, requirements, instructions, licenseType, licenseDuration, downloadLimit, } = req.body;
    if (!name || !description || !price || !categoryId) {
        return next((0, errorHandler_1.createError)("All required fields must be provided", 400));
    }
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    let fileUrl = "";
    let thumbnail = "";
    let previewUrl = "";
    const images = [];
    if (req.files) {
        const files = req.files;
        if (files.file && files.file[0]) {
            const fileUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.file[0], "products/files", "raw");
            fileUrl = fileUpload.url;
        }
        if (files.thumbnail && files.thumbnail[0]) {
            const thumbnailUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.thumbnail[0], "products/thumbnails");
            thumbnail = thumbnailUpload.url;
        }
        if (files.preview && files.preview[0]) {
            const previewUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.preview[0], "products/previews");
            previewUrl = previewUpload.url;
        }
        if (files.images) {
            for (const image of files.images) {
                const imageUpload = await cloudinaryService_1.cloudinaryService.uploadFile(image, "products/images");
                images.push(imageUpload.url);
            }
        }
    }
    const product = await Product_1.Product.create({
        vendorId: vendor._id,
        categoryId,
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        discountPercentage: discountPercentage
            ? parseFloat(discountPercentage)
            : undefined,
        isDigital: true,
        fileUrl,
        thumbnail,
        previewUrl,
        images,
        tags: tags ? JSON.parse(tags) : [],
        features: features ? JSON.parse(features) : [],
        requirements,
        instructions,
        licenseType,
        licenseDuration: licenseDuration ? parseInt(licenseDuration) : undefined,
        downloadLimit: downloadLimit ? parseInt(downloadLimit) : -1,
    });
    try {
        const io = SocketService_1.SocketService.getIO();
        io.emit("product:created", {
            productId: product._id,
            vendorId: vendor._id,
            product: product,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: vendor.userId.toString(),
            type: "PRODUCT_UPDATED",
            title: "Product Created Successfully",
            message: `Your product "${product.name}" has been created and is pending approval.`,
            category: "PRODUCT",
            priority: "NORMAL",
            channels: ["IN_APP"],
            data: {
                productId: product._id,
                productName: product.name,
                status: "PENDING",
            },
        });
    }
    catch (error) {
        console.error("Failed to create product notification:", error);
    }
    res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
    });
});
exports.updateProduct = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const product = await Product_1.Product.findOne({
        _id: req.params.id,
        vendorId: vendor._id,
    });
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    const { name, description, price, originalPrice, discountPercentage, categoryId, tags, features, requirements, instructions, licenseType, licenseDuration, downloadLimit, } = req.body;
    if (req.files) {
        const files = req.files;
        if (files.file && files.file[0]) {
            if (product.fileUrl) {
                const oldPublicId = cloudinaryService_1.cloudinaryService.extractPublicId(product.fileUrl);
                if (oldPublicId) {
                    await cloudinaryService_1.cloudinaryService.deleteFile(oldPublicId);
                }
            }
            const fileUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.file[0], "products/files", "raw");
            product.fileUrl = fileUpload.url;
        }
        if (files.thumbnail && files.thumbnail[0]) {
            if (product.thumbnail) {
                const oldPublicId = cloudinaryService_1.cloudinaryService.extractPublicId(product.thumbnail);
                if (oldPublicId) {
                    await cloudinaryService_1.cloudinaryService.deleteFile(oldPublicId);
                }
            }
            const thumbnailUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.thumbnail[0], "products/thumbnails");
            product.thumbnail = thumbnailUpload.url;
        }
        if (files.preview && files.preview[0]) {
            if (product.previewUrl) {
                const oldPublicId = cloudinaryService_1.cloudinaryService.extractPublicId(product.previewUrl);
                if (oldPublicId) {
                    await cloudinaryService_1.cloudinaryService.deleteFile(oldPublicId);
                }
            }
            const previewUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.preview[0], "products/previews");
            product.previewUrl = previewUpload.url;
        }
        if (files.images) {
            if (product.images && product.images.length > 0) {
                await cloudinaryService_1.cloudinaryService
                    .deleteMultipleFiles(product.images)
                    .catch((error) => {
                    console.error("Failed to delete old images from Cloudinary:", error);
                });
            }
            const newImages = [];
            for (const image of files.images) {
                const imageUpload = await cloudinaryService_1.cloudinaryService.uploadFile(image, "products/images");
                newImages.push(imageUpload.url);
            }
            product.images = newImages;
        }
    }
    if (name) {
        product.name = name;
        product.slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    if (description)
        product.description = description;
    if (price)
        product.price = parseFloat(price);
    if (originalPrice !== undefined)
        product.originalPrice = originalPrice
            ? parseFloat(originalPrice)
            : undefined;
    if (discountPercentage !== undefined)
        product.discountPercentage = discountPercentage
            ? parseFloat(discountPercentage)
            : undefined;
    if (categoryId)
        product.categoryId = categoryId;
    if (tags)
        product.tags = JSON.parse(tags);
    if (features)
        product.features = JSON.parse(features);
    if (requirements !== undefined)
        product.requirements = requirements;
    if (instructions !== undefined)
        product.instructions = instructions;
    if (licenseType)
        product.licenseType = licenseType;
    if (licenseDuration !== undefined)
        product.licenseDuration = licenseDuration
            ? parseInt(licenseDuration)
            : undefined;
    if (downloadLimit !== undefined)
        product.downloadLimit = downloadLimit ? parseInt(downloadLimit) : -1;
    await product.save();
    try {
        const io = SocketService_1.SocketService.getIO();
        io.emit("product:updated", {
            productId: product._id,
            vendorId: vendor._id,
            product: product,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: vendor.userId.toString(),
            type: "PRODUCT_UPDATED",
            title: "Product Updated Successfully",
            message: `Your product "${product.name}" has been updated successfully.`,
            category: "PRODUCT",
            priority: "NORMAL",
            channels: ["IN_APP"],
            data: {
                productId: product._id,
                productName: product.name,
                status: product.isApproved ? "APPROVED" : "PENDING",
            },
        });
    }
    catch (error) {
        console.error("Failed to create product update notification:", error);
    }
    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
    });
});
exports.deleteProduct = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const product = await Product_1.Product.findOne({
        _id: req.params.id,
        vendorId: vendor._id,
    });
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    const urlsToDelete = [];
    if (product.fileUrl) {
        urlsToDelete.push(product.fileUrl);
    }
    if (product.thumbnail) {
        urlsToDelete.push(product.thumbnail);
    }
    if (product.images && product.images.length > 0) {
        urlsToDelete.push(...product.images);
    }
    await Product_1.Product.findByIdAndDelete(req.params.id);
    if (urlsToDelete.length > 0) {
        cloudinaryService_1.cloudinaryService.deleteMultipleFiles(urlsToDelete).catch((error) => {
            console.error("Failed to delete files from Cloudinary:", error);
        });
    }
    try {
        const io = SocketService_1.SocketService.getIO();
        io.emit("product:deleted", {
            productId: req.params.id,
            vendorId: vendor._id,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: vendor.userId.toString(),
            type: "PRODUCT_DISCONTINUED",
            title: "Product Deleted Successfully",
            message: `Your product "${product.name}" has been deleted successfully.`,
            category: "PRODUCT",
            priority: "NORMAL",
            channels: ["IN_APP"],
            data: {
                productId: product._id,
                productName: product.name,
            },
        });
    }
    catch (error) {
        console.error("Failed to create product deletion notification:", error);
    }
    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});
exports.downloadProductFile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    const { orderId } = req.query;
    try {
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return next((0, errorHandler_1.createError)("Product not found", 404));
        }
        const order = await Order_1.Order.findOne({
            _id: orderId,
            userId: user._id,
            "items.productId": productId,
            status: "DELIVERED",
        }).sort({ createdAt: -1 });
        if (!order) {
            await (0, downloadSecurityService_1.logDownloadActivity)(user._id, productId, orderId, "FAILED", {
                reason: "No valid order found",
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });
            return next((0, errorHandler_1.createError)("No valid order found for this product", 403));
        }
        const orderItemIndex = order.items.findIndex((item) => item.productId.toString() === productId);
        if (orderItemIndex === -1) {
            return next((0, errorHandler_1.createError)("Product not found in order", 404));
        }
        const orderItem = order.items[orderItemIndex];
        if (orderItem.downloadLimit &&
            orderItem.downloadLimit > 0 &&
            orderItem.downloadCount &&
            orderItem.downloadCount >= orderItem.downloadLimit) {
            await (0, downloadSecurityService_1.logDownloadActivity)(user._id, productId, orderId, "FAILED", {
                reason: "Download limit exceeded",
                downloadCount: orderItem.downloadCount,
                downloadLimit: orderItem.downloadLimit,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });
            return next((0, errorHandler_1.createError)("Download limit exceeded for this purchase", 403));
        }
        if (product.licenseDuration && order.deliveredAt) {
            const licenseExpiryDate = new Date(order.deliveredAt.getTime() +
                product.licenseDuration * 24 * 60 * 60 * 1000);
            if (licenseExpiryDate < new Date()) {
                await (0, downloadSecurityService_1.logDownloadActivity)(user._id, productId, orderId, "FAILED", {
                    reason: "License expired",
                    licenseExpiryDate: licenseExpiryDate,
                    licenseDuration: product.licenseDuration,
                    deliveredAt: order.deliveredAt,
                    ip: req.ip,
                    userAgent: req.get("User-Agent"),
                });
                return next((0, errorHandler_1.createError)("License has expired", 403));
            }
        }
        if (!product.fileUrl) {
            return next((0, errorHandler_1.createError)("Product file not available", 404));
        }
        const downloadToken = (0, downloadSecurityService_1.generateDownloadToken)(productId, orderId, user._id, orderItem.downloadCount || 0);
        const fileExtension = product.fileUrl.split(".").pop() || "pdf";
        const safeFilename = `${product.name
            .replace(/[^a-zA-Z0-9\s.-]/g, "_")
            .replace(/\s+/g, "_")
            .trim()}.${fileExtension}`;
        const publicId = extractPublicIdFromCloudinaryUrl(product.fileUrl);
        if (!publicId) {
            console.error("Failed to extract public ID from URL:", product.fileUrl);
            return next((0, errorHandler_1.createError)("Invalid file URL", 500));
        }
        console.log("Extracted public ID:", publicId);
        console.log("Safe filename:", safeFilename);
        const downloadUrl = cloudinary_1.v2.url(publicId, {
            resource_type: "raw",
            flags: "attachment",
            transformation: [{ flags: `attachment:${safeFilename}` }],
        });
        console.log("Generated download URL:", downloadUrl);
        await Order_1.Order.updateOne({
            _id: order._id,
            "items.productId": productId,
        }, {
            $inc: { [`items.${orderItemIndex}.downloadCount`]: 1 },
            $set: { [`items.${orderItemIndex}.lastDownloadAt`]: new Date() },
        });
        await (0, downloadSecurityService_1.logDownloadActivity)(user._id, productId, orderId, "INITIATED", {
            filename: safeFilename,
            publicId: publicId,
            originalUrl: product.fileUrl,
            downloadCount: (orderItem.downloadCount || 0) + 1,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });
        res.status(200).json({
            success: true,
            data: {
                downloadUrl,
                filename: safeFilename,
                token: downloadToken,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                remainingDownloads: orderItem.downloadLimit === -1
                    ? -1
                    : orderItem.downloadLimit - (orderItem.downloadCount + 1),
            },
        });
    }
    catch (error) {
        console.error("Download error:", error);
        await (0, downloadSecurityService_1.logDownloadActivity)(user._id, productId, orderId, "FAILED", {
            error: error.message,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });
        return next((0, errorHandler_1.createError)("Download failed", 500));
    }
});
function extractPublicIdFromCloudinaryUrl(url) {
    try {
        const urlObj = new url_1.URL(url);
        const pathParts = urlObj.pathname
            .split("/")
            .filter((part) => part.length > 0);
        const uploadIndex = pathParts.findIndex((part) => part === "upload");
        if (uploadIndex === -1) {
            console.error("Could not find 'upload' in URL path:", url);
            return null;
        }
        const afterUpload = pathParts.slice(uploadIndex + 1);
        const startIndex = afterUpload[0] && afterUpload[0].match(/^v\d+$/) ? 1 : 0;
        const publicId = afterUpload.slice(startIndex).join("/");
        const lastDotIndex = publicId.lastIndexOf(".");
        const finalPublicId = lastDotIndex > 0 ? publicId.substring(0, lastDotIndex) : publicId;
        return finalPublicId || null;
    }
    catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}
//# sourceMappingURL=productController.js.map