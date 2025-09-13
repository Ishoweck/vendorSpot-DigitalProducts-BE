import { Request, Response, NextFunction } from "express";
import { Vendor } from "@/models/Vendor";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Review } from "@/models/Review";
import { cloudinaryService } from "@/services/cloudinaryService";
import { asyncHandler, createError } from "@/middleware/errorHandler";
import { SocketService } from "@/services/SocketService";
import { createNotification } from "./NotificationController";


export const createVendorProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const {
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      businessEmail,
      website,
      taxId,
      bankName,
      bankAccountNumber,
      bankAccountName,
    } = req.body;

    if (!businessName) {
      return next(createError("Business name is required", 400));
    }

    const existingVendor = await Vendor.findOne({ userId: user._id });
    if (existingVendor) {
      return next(createError("Vendor profile already exists", 400));
    }

    let logoUrl = "";
    let bannerUrl = "";
    const verificationDocuments: string[] = [];

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.logo && files.logo[0]) {
        const logoUpload = await cloudinaryService.uploadFile(
          files.logo[0],
          "vendors/logos"
        );
        logoUrl = logoUpload.url;
      }

      if (files.banner && files.banner[0]) {
        const bannerUpload = await cloudinaryService.uploadFile(
          files.banner[0],
          "vendors/banners"
        );
        bannerUrl = bannerUpload.url;
      }

      if (files.documents) {
        for (const doc of files.documents) {
          const docUpload = await cloudinaryService.uploadFile(
            doc,
            "vendors/documents"
          );
          verificationDocuments.push(docUpload.url);
        }
      }
    }

    



  
    const vendor = await Vendor.create({
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

    await User.findByIdAndUpdate(user._id, { role: "VENDOR" });

    res.status(201).json({
      success: true,
      message: "Vendor profile created successfully",
      data: vendor,
    });
  }
);


export const getVendorProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const vendor = await Vendor.findOne({ userId: user._id }).populate(
      "userId",
      "firstName lastName email"
    );
    if (!vendor) {
      return next(createError("Vendor profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  }
);

export const updateVendorProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const {
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      businessEmail,
      website,
      bankName,
      bankAccountNumber,
      bankAccountName,
      taxId,
    } = req.body;

    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) {
      return next(createError("Vendor profile not found", 404));
    }

    const isVerificationSubmission =
      taxId && bankName && bankAccountNumber && bankAccountName;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.logo && files.logo[0]) {
        const logoUpload = await cloudinaryService.uploadFile(
          files.logo[0],
          "vendors/logos"
        );
        if (vendor.logo) {
          const oldId = cloudinaryService.extractPublicId(vendor.logo);
          if (oldId) await cloudinaryService.deleteFile(oldId);
        }
        vendor.logo = logoUpload.url;
      }

      if (files.banner && files.banner[0]) {
        const bannerUpload = await cloudinaryService.uploadFile(
          files.banner[0],
          "vendors/banners"
        );
        if (vendor.banner) {
          const oldId = cloudinaryService.extractPublicId(vendor.banner);
          if (oldId) await cloudinaryService.deleteFile(oldId);
        }
        vendor.banner = bannerUpload.url;
      }

      if (files.documents) {
        const verificationDocuments: string[] = [];
        for (const doc of files.documents) {
          const docUpload = await cloudinaryService.uploadFile(
            doc,
            "vendors/documents"
          );
          verificationDocuments.push(docUpload.url);
        }
        vendor.verificationDocuments = verificationDocuments;
      }
    }

    if (businessName) vendor.businessName = businessName;
    if (businessDescription) vendor.businessDescription = businessDescription;
    if (businessAddress) vendor.businessAddress = businessAddress;
    if (businessPhone) vendor.businessPhone = businessPhone;
    if (businessEmail) vendor.businessEmail = businessEmail;
    if (website) vendor.website = website;
    if (bankName) vendor.bankName = bankName;
    if (bankAccountNumber) vendor.bankAccountNumber = bankAccountNumber;
    if (bankAccountName) vendor.bankAccountName = bankAccountName;
    if (taxId) vendor.taxId = taxId;

    if (isVerificationSubmission) {
      vendor.verificationStatus = "PENDING";

      try {
        await createNotification({
          userId: vendor.userId.toString(),
          type: "VERIFICATION_SUBMITTED",
          title: "Verification Documents Submitted",
          message:
            "Your verification documents have been submitted successfully. Our team will review them and notify you of the outcome.",
          category: "ACCOUNT",
          priority: "NORMAL",
          channels: ["IN_APP"],
        });
      } catch (error) {
        console.error("Failed to create verification notification:", error);
      }
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      data: vendor,
    });
  }
);

export const getVendorDashboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) {
      return next(createError("Vendor profile not found", 404));
    }

    const totalProducts = await Product.countDocuments({
      vendorId: vendor._id,
    });
    const activeProducts = await Product.countDocuments({
      vendorId: vendor._id,
      isActive: true,
      isApproved: true,
    });
    const pendingProducts = await Product.countDocuments({
      vendorId: vendor._id,
      approvalStatus: "PENDING",
    });

    const totalOrders = await Order.countDocuments({
      "items.vendorId": vendor._id,
    });
    const completedOrders = await Order.countDocuments({
      "items.vendorId": vendor._id,
      status: "DELIVERED",
    });
    const pendingOrders = await Order.countDocuments({
      "items.vendorId": vendor._id,
      status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    });

    const totalRevenue = await Order.aggregate([
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

    const vendorRating = await Review.aggregate([
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

    await Vendor.findByIdAndUpdate(vendor._id, {
      $set: {
        rating: calculatedRating,
        totalProducts: totalProducts,
        totalSales: totalRevenue[0]?.total || 0,
      },
    });

    const recentOrders = await Order.find({
      "items.vendorId": vendor._id,
    })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);

    const topProducts = await Product.find({
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
  }
);

export const getVendorSales = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { period = "month" } = req.query;

    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) {
      return next(createError("Vendor profile not found", 404));
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

    const salesData = await Order.aggregate([
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
  }
);

export const getAllVendors = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };

    if (req.query.search) {
      query.businessName = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.verificationStatus) {
      query.verificationStatus = req.query.verificationStatus;
    }


    if (req.query.isSponsored !== undefined) {
      query.isSponsored = req.query.isSponsored === "true";
    }

    const vendors = await Vendor.find(query)
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments(query);

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
  }
);


export const getVendorById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const vendor = await Vendor.findById(req.params.id).populate(
      "userId",
      "firstName lastName"
    );

    if (!vendor) {
      return next(createError("Vendor not found", 404));
    }

    const products = await Product.find({
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
  }
);

export const verifyVendor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { status, rejectionReason } = req.body;

    if (user.role !== "ADMIN") {
      return next(createError("Unauthorized", 403));
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return next(createError("Vendor not found", 404));
    }

    const validStatuses = ["APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return next(createError("Invalid verification status", 400));
    }

    vendor.verificationStatus = status;
    await vendor.save();

    if (status === "APPROVED") {
      await Product.updateMany(
        { vendorId: vendor._id },
        { isApproved: true, approvalStatus: "APPROVED" }
      );
    }

    try {
      await createNotification({
        userId: vendor.userId.toString(),
        type: status === "APPROVED" ? "VENDOR_APPROVED" : "VENDOR_REJECTED",
        title:
          status === "APPROVED"
            ? "Vendor Account Approved"
            : "Vendor Account Rejected",
        message:
          status === "APPROVED"
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
    } catch (error) {
      console.error(
        "Failed to create vendor verification notification:",
        error
      );
    }

    try {
      const io = SocketService.getIO();
      io.to(vendor.userId.toString()).emit("vendor:verification_updated", {
        vendorId: vendor._id,
        status,
        rejectionReason,
      });
    } catch (error) {
      console.log("Socket emit error:", error);
    }

    res.status(200).json({
      success: true,
      message: `Vendor ${status.toLowerCase()} successfully`,
      data: vendor,
    });
  }
);


export const getVendorByBusinessName = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const businessName = req.params.businessName;

    const vendor = await Vendor.findOne({
      businessName: { $regex: `^${businessName}$`, $options: "i" },
      isActive: true,
    }).populate("userId", "firstName lastName email");

    if (!vendor) {
      return next(createError("Vendor not found", 404));
    }

    const products = await Product.find({
      vendorId: vendor._id,
      isActive: true,
      isApproved: true,
    }).limit(6);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          _id: vendor._id,
          businessName: vendor.businessName,
          businessDescription: vendor.businessDescription,
          businessAddress: vendor.businessAddress,
          businessPhone: vendor.businessPhone,
          businessEmail: vendor.businessEmail,
          website: vendor.website,
          logo: vendor.logo,
          // avatar: vendor.avatar,
          banner: vendor.banner,
          verificationStatus: vendor.verificationStatus,
          rating: vendor.rating,
          totalSales: vendor.totalSales,
          totalProducts: vendor.totalProducts,
          // commissionRate: vendor.commissionRate,
          // isSponsored: vendor.isSponsored,
          // sponsorshipStartDate: vendor.sponsorshipStartDate,
          // sponsorshipEndDate: vendor.sponsorshipEndDate,
          // createdAt: vendor.createdAt,
          // updatedAt: vendor.updatedAt,
          user: vendor.userId, 
        },
        products,
      },
    });
  }
);
