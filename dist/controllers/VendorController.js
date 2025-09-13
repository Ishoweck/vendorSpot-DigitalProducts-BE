"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVendor = exports.getVendorById = exports.getAllVendors = exports.getVendorSales = exports.getVendorDashboard = exports.updateVendorProfile = exports.getVendorProfile = exports.createVendorProfile = void 0;
const Vendor_1 = require("@/models/Vendor");
const User_1 = require("@/models/User");
const Product_1 = require("@/models/Product");
const Order_1 = require("@/models/Order");
const Review_1 = require("@/models/Review");
const cloudinaryService_1 = require("@/services/cloudinaryService");
const errorHandler_1 = require("@/middleware/errorHandler");
const SocketService_1 = require("@/services/SocketService");
const NotificationController_1 = require("./NotificationController");
exports.createVendorProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { businessName, businessDescription, businessAddress, businessPhone, businessEmail, website, taxId, bankName, bankAccountNumber, bankAccountName, } = req.body;
    if (!businessName) {
        return next((0, errorHandler_1.createError)("Business name is required", 400));
    }
    const existingVendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (existingVendor) {
        return next((0, errorHandler_1.createError)("Vendor profile already exists", 400));
    }
    let logoUrl = "";
    let bannerUrl = "";
    const verificationDocuments = [];
    if (req.files) {
        const files = req.files;
        if (files.logo && files.logo[0]) {
            const logoUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.logo[0], "vendors/logos");
            logoUrl = logoUpload.url;
        }
        if (files.banner && files.banner[0]) {
            const bannerUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.banner[0], "vendors/banners");
            bannerUrl = bannerUpload.url;
        }
        if (files.documents) {
            for (const doc of files.documents) {
                const docUpload = await cloudinaryService_1.cloudinaryService.uploadFile(doc, "vendors/documents");
                verificationDocuments.push(docUpload.url);
            }
        }
    }
    const vendor = await Vendor_1.Vendor.create({
        userId: user._id,
        businessName,
        businessDescription,
        businessAddress,
        businessPhone,
        businessEmail,
        website,
        logo: logoUrl,
        banner: bannerUrl,
        taxId,
        bankName,
        bankAccountNumber,
        bankAccountName,
        verificationDocuments,
        verificationStatus: "NOT_VERIFIED",
    });
    await User_1.User.findByIdAndUpdate(user._id, { role: "VENDOR" });
    res.status(201).json({
        success: true,
        message: "Vendor profile created successfully",
        data: vendor,
    });
});
exports.getVendorProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id }).populate("userId", "firstName lastName email");
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor profile not found", 404));
    }
    res.status(200).json({
        success: true,
        data: vendor,
    });
});
exports.updateVendorProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { businessName, businessDescription, businessAddress, businessPhone, businessEmail, website, bankName, bankAccountNumber, bankAccountName, taxId, } = req.body;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor profile not found", 404));
    }
    const isVerificationSubmission = taxId && bankName && bankAccountNumber && bankAccountName;
    if (req.files) {
        const files = req.files;
        if (files.logo && files.logo[0]) {
            const logoUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.logo[0], "vendors/logos");
            if (vendor.logo) {
                const oldId = cloudinaryService_1.cloudinaryService.extractPublicId(vendor.logo);
                if (oldId)
                    await cloudinaryService_1.cloudinaryService.deleteFile(oldId);
            }
            vendor.logo = logoUpload.url;
        }
        if (files.banner && files.banner[0]) {
            const bannerUpload = await cloudinaryService_1.cloudinaryService.uploadFile(files.banner[0], "vendors/banners");
            if (vendor.banner) {
                const oldId = cloudinaryService_1.cloudinaryService.extractPublicId(vendor.banner);
                if (oldId)
                    await cloudinaryService_1.cloudinaryService.deleteFile(oldId);
            }
            vendor.banner = bannerUpload.url;
        }
        if (files.documents) {
            const verificationDocuments = [];
            for (const doc of files.documents) {
                const docUpload = await cloudinaryService_1.cloudinaryService.uploadFile(doc, "vendors/documents");
                verificationDocuments.push(docUpload.url);
            }
            vendor.verificationDocuments = verificationDocuments;
        }
    }
    if (businessName)
        vendor.businessName = businessName;
    if (businessDescription)
        vendor.businessDescription = businessDescription;
    if (businessAddress)
        vendor.businessAddress = businessAddress;
    if (businessPhone)
        vendor.businessPhone = businessPhone;
    if (businessEmail)
        vendor.businessEmail = businessEmail;
    if (website)
        vendor.website = website;
    if (bankName)
        vendor.bankName = bankName;
    if (bankAccountNumber)
        vendor.bankAccountNumber = bankAccountNumber;
    if (bankAccountName)
        vendor.bankAccountName = bankAccountName;
    if (taxId)
        vendor.taxId = taxId;
    if (isVerificationSubmission) {
        vendor.verificationStatus = "PENDING";
        try {
            await (0, NotificationController_1.createNotification)({
                userId: vendor.userId.toString(),
                type: "VERIFICATION_SUBMITTED",
                title: "Verification Documents Submitted",
                message: "Your verification documents have been submitted successfully. Our team will review them and notify you of the outcome.",
                category: "ACCOUNT",
                priority: "NORMAL",
                channels: ["IN_APP"],
            });
        }
        catch (error) {
            console.error("Failed to create verification notification:", error);
        }
    }
    await vendor.save();
    res.status(200).json({
        success: true,
        message: "Vendor profile updated successfully",
        data: vendor,
    });
});
exports.getVendorDashboard = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor profile not found", 404));
    }
    const totalProducts = await Product_1.Product.countDocuments({
        vendorId: vendor._id,
    });
    const activeProducts = await Product_1.Product.countDocuments({
        vendorId: vendor._id,
        isActive: true,
        isApproved: true,
    });
    const pendingProducts = await Product_1.Product.countDocuments({
        vendorId: vendor._id,
        approvalStatus: "PENDING",
    });
    const totalOrders = await Order_1.Order.countDocuments({
        "items.vendorId": vendor._id,
    });
    const completedOrders = await Order_1.Order.countDocuments({
        "items.vendorId": vendor._id,
        status: "DELIVERED",
    });
    const pendingOrders = await Order_1.Order.countDocuments({
        "items.vendorId": vendor._id,
        status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    });
    const totalRevenue = await Order_1.Order.aggregate([
        { $match: { "items.vendorId": vendor._id, paymentStatus: "PAID" } },
        { $unwind: "$items" },
        { $match: { "items.vendorId": vendor._id } },
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            },
        },
    ]);
    const vendorRating = await Review_1.Review.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $match: {
                "product.vendorId": vendor._id,
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
    const calculatedRating = vendorRating[0]?.average
        ? Math.round(vendorRating[0].average * 10) / 10
        : 0;
    const totalReviews = vendorRating[0]?.total || 0;
    await Vendor_1.Vendor.findByIdAndUpdate(vendor._id, {
        $set: {
            rating: calculatedRating,
            totalProducts: totalProducts,
            totalSales: totalRevenue[0]?.total || 0,
        },
    });
    const recentOrders = await Order_1.Order.find({
        "items.vendorId": vendor._id,
    })
        .populate("userId", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(10);
    const topProducts = await Product_1.Product.find({
        vendorId: vendor._id,
        isActive: true,
    })
        .sort({ soldCount: -1 })
        .limit(5);
    res.status(200).json({
        success: true,
        data: {
            stats: {
                totalProducts,
                activeProducts,
                pendingProducts,
                totalOrders,
                completedOrders,
                pendingOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                rating: calculatedRating,
                totalReviews,
            },
            recentOrders,
            topProducts,
        },
    });
});
exports.getVendorSales = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { period = "month" } = req.query;
    const vendor = await Vendor_1.Vendor.findOne({ userId: user._id });
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor profile not found", 404));
    }
    let dateFilter = {};
    const now = new Date();
    switch (period) {
        case "week":
            dateFilter = {
                createdAt: {
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                },
            };
            break;
        case "month":
            dateFilter = {
                createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
            };
            break;
        case "year":
            dateFilter = {
                createdAt: { $gte: new Date(now.getFullYear(), 0, 1) },
            };
            break;
    }
    const salesData = await Order_1.Order.aggregate([
        {
            $match: {
                "items.vendorId": vendor._id,
                paymentStatus: "PAID",
                ...dateFilter,
            },
        },
        { $unwind: "$items" },
        { $match: { "items.vendorId": vendor._id } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                },
                revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                orders: { $sum: 1 },
                products: { $sum: "$items.quantity" },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    res.status(200).json({
        success: true,
        data: salesData,
    });
});
exports.getAllVendors = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    if (req.query.search) {
        query.businessName = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.verificationStatus) {
        query.verificationStatus = req.query.verificationStatus;
    }
    const vendors = await Vendor_1.Vendor.find(query)
        .populate("userId", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Vendor_1.Vendor.countDocuments(query);
    res.status(200).json({
        success: true,
        data: vendors,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});
exports.getVendorById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const vendor = await Vendor_1.Vendor.findById(req.params.id).populate("userId", "firstName lastName");
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const products = await Product_1.Product.find({
        vendorId: vendor._id,
        isActive: true,
        isApproved: true,
    }).limit(6);
    res.status(200).json({
        success: true,
        data: {
            vendor,
            products,
        },
    });
});
exports.verifyVendor = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { status, rejectionReason } = req.body;
    if (user.role !== "ADMIN") {
        return next((0, errorHandler_1.createError)("Unauthorized", 403));
    }
    const vendor = await Vendor_1.Vendor.findById(req.params.id);
    if (!vendor) {
        return next((0, errorHandler_1.createError)("Vendor not found", 404));
    }
    const validStatuses = ["APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
        return next((0, errorHandler_1.createError)("Invalid verification status", 400));
    }
    vendor.verificationStatus = status;
    await vendor.save();
    if (status === "APPROVED") {
        await Product_1.Product.updateMany({ vendorId: vendor._id }, { isApproved: true, approvalStatus: "APPROVED" });
    }
    try {
        await (0, NotificationController_1.createNotification)({
            userId: vendor.userId.toString(),
            type: status === "APPROVED" ? "VENDOR_APPROVED" : "VENDOR_REJECTED",
            title: status === "APPROVED"
                ? "Vendor Account Approved"
                : "Vendor Account Rejected",
            message: status === "APPROVED"
                ? "Congratulations! Your vendor account has been approved. You can now start selling your digital products."
                : `Your vendor account application has been rejected. Reason: ${rejectionReason || "Please contact support for details."}`,
            category: "ACCOUNT",
            priority: "HIGH",
            channels: ["IN_APP", "EMAIL"],
            data: {
                vendorId: vendor._id,
                status: status,
                reason: rejectionReason,
            },
        });
    }
    catch (error) {
        console.error("Failed to create vendor verification notification:", error);
    }
    try {
        const io = SocketService_1.SocketService.getIO();
        io.to(vendor.userId.toString()).emit("vendor:verification_updated", {
            vendorId: vendor._id,
            status,
            rejectionReason,
        });
    }
    catch (error) {
        console.log("Socket emit error:", error);
    }
    res.status(200).json({
        success: true,
        message: `Vendor ${status.toLowerCase()} successfully`,
        data: vendor,
    });
});
//# sourceMappingURL=VendorController.js.map