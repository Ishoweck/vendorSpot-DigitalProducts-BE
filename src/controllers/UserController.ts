import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { cloudinaryService } from "../services/cloudinaryService";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { createNotification } from "./NotificationController";
import { Vendor } from "../models/Vendor";

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const userProfile = await User.findById(user._id).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires"
    );

    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    let vendorId: any = undefined;
    if (userProfile.role === "VENDOR") {
      const vendor = await Vendor.findOne({ userId: user._id }).select("_id");
      vendorId = vendor?._id;
    }

    const profileObj: any = (userProfile as any).toObject
      ? (userProfile as any).toObject()
      : userProfile;
    if (vendorId) profileObj.vendorId = vendorId;

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: profileObj,
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      postalCode,
    } = req.body;

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    if (phone) {
      const phoneStr = String(phone).trim();
      const e164 = /^\+?[1-9]\d{9,14}$/;
      if (!e164.test(phoneStr)) {
        return next(createError("Enter a valid phone number", 400));
      }
      const existingUser = await User.findOne({
        phone: phoneStr,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return next(
          createError(
            "This phone number is already registered by another user",
            400
          )
        );
      }
      userProfile.phone = phoneStr;
    }

    if (firstName) userProfile.firstName = firstName;
    if (lastName) userProfile.lastName = lastName;
    if (dateOfBirth) userProfile.dateOfBirth = new Date(dateOfBirth);
    if (gender) userProfile.gender = gender;
    if (address) userProfile.address = address;
    if (city) userProfile.city = city;
    if (state) userProfile.state = state;
    if (country) userProfile.country = country;
    if (postalCode) userProfile.postalCode = postalCode;

    await userProfile.save();

    try {
      await createNotification({
        userId: String(user._id),
        type: "PROFILE_UPDATED",
        title: "Profile Updated Successfully",
        message: "Your profile has been updated successfully.",
        category: "ACCOUNT",
        priority: "NORMAL",
        channels: ["IN_APP"],
      });
    } catch (error) {
      console.error("Failed to create profile update notification:", error);
    }

    const updatedUser = await User.findById(user._id).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires"
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }
);

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!req.file) {
      return next(createError("Please upload an image file", 400));
    }

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    try {
      const uploadResult = await cloudinaryService.uploadFile(
        req.file,
        "avatars"
      );

      if (userProfile.avatar) {
        const publicId = cloudinaryService.extractPublicId(userProfile.avatar);
        if (publicId) {
          await cloudinaryService.deleteFile(publicId);
        }
      }

      userProfile.avatar = uploadResult.url;
      await userProfile.save();

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          avatar: uploadResult.url,
        },
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      return next(createError("Failed to upload avatar", 500));
    }
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        createError("Current password and new password are required", 400)
      );
    }

    if (newPassword.length < 6) {
      return next(
        createError("New password must be at least 6 characters", 400)
      );
    }

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    const isCurrentPasswordValid =
      await userProfile.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(createError("Current password is incorrect", 400));
    }

    userProfile.password = newPassword;
    await userProfile.save();

    try {
      await createNotification({
        userId: String(user._id),
        type: "PASSWORD_CHANGED",
        title: "Password Changed",
        message:
          "Your password has been changed successfully. If you didn't make this change, please contact support immediately.",
        category: "SECURITY",
        priority: "HIGH",
        channels: ["IN_APP", "EMAIL"],
      });
    } catch (error) {
      console.error("Failed to create password change notification:", error);
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

export const getUserDashboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const totalOrders = await Order.countDocuments({ userId: user._id });
    const completedOrders = await Order.countDocuments({
      userId: user._id,
      status: "DELIVERED",
    });
    const pendingOrders = await Order.countDocuments({
      userId: user._id,
      status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    });

    const totalSpent = await Order.aggregate([
      { $match: { userId: user._id, paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const recentOrders = await Order.find({ userId: user._id })
      .populate({
        path: "items.productId",
        select: "name thumbnail",
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const totalReviews = await Review.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          completedOrders,
          pendingOrders,
          totalSpent: totalSpent[0]?.total || 0,
          totalReviews,
        },
        recentOrders,
      },
    });
  }
);

export const getUserWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    const userProfile = await User.findById(user._id).populate({
      path: "wishlist",
      select: "name price thumbnail vendorId categoryId",
      populate: [
        { path: "vendorId", select: "businessName" },
        { path: "categoryId", select: "name" },
      ],
    });

    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    const wishlist = userProfile.wishlist || [];
    const total = wishlist.length;
    const paginatedWishlist = wishlist.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: paginatedWishlist,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

export const addToWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { productId } = req.body;

    if (!productId) {
      return next(createError("Product ID is required", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError("Product not found", 404));
    }

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    if (!userProfile.wishlist) {
      userProfile.wishlist = [];
    }

    if (userProfile.wishlist.includes(productId)) {
      return next(createError("Product already in wishlist", 400));
    }

    userProfile.wishlist.push(productId);
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  }
);

export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { productId } = req.params;

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    if (!userProfile.wishlist) {
      userProfile.wishlist = [];
    }

    const index = userProfile.wishlist.findIndex(
      (id: any) => id.toString() === productId
    );
    if (index === -1) {
      return next(createError("Product not in wishlist", 404));
    }

    userProfile.wishlist.splice(index, 1);
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  }
);

export const getCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const userProfile = await User.findById(user._id).populate({
      path: "cart.items.productId",
      select: "name price thumbnail vendorId categoryId",
      populate: [
        { path: "vendorId", select: "businessName" },
        { path: "categoryId", select: "name" },
      ],
    });

    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    const cart = userProfile.cart || { items: [] };

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);

export const addToCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return next(createError("Product ID is required", 400));
    }

    if (quantity < 1) {
      return next(createError("Quantity must be at least 1", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError("Product not found", 404));
    }

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    if (!userProfile.cart) {
      userProfile.cart = { items: [] };
    }

    const existingItemIndex = userProfile.cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      userProfile.cart.items[existingItemIndex].quantity += quantity;
    } else {
      userProfile.cart.items.push({
        productId,
        quantity,
        addedAt: new Date(),
      });
    }

    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
    });
  }
);

export const updateCartItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return next(createError("Valid quantity is required", 400));
    }

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    if (!userProfile.cart) {
      return next(createError("Cart is empty", 404));
    }

    const itemIndex = userProfile.cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return next(createError("Product not in cart", 404));
    }

    if (quantity === 0) {
      userProfile.cart.items.splice(itemIndex, 1);
    } else {
      userProfile.cart.items[itemIndex].quantity = quantity;
    }

    await userProfile.save();

    res.status(200).json({
      success: true,
      message:
        quantity === 0 ? "Product removed from cart" : "Cart item updated",
    });
  }
);

export const removeFromCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { productId } = req.params;

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    if (!userProfile.cart) {
      return next(createError("Cart is empty", 404));
    }

    const itemIndex = userProfile.cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return next(createError("Product not in cart", 404));
    }

    userProfile.cart.items.splice(itemIndex, 1);
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  }
);

export const clearCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    userProfile.cart = { items: [] };
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  }
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { password } = req.body;

    if (!password) {
      return next(createError("Password is required to delete account", 400));
    }

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      return next(createError("User not found", 404));
    }

    const isPasswordValid = await userProfile.comparePassword(password);
    if (!isPasswordValid) {
      return next(createError("Password is incorrect", 400));
    }

    const hasActiveOrders = await Order.countDocuments({
      userId: user._id,
      status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    });

    if (hasActiveOrders > 0) {
      return next(createError("Cannot delete account with active orders", 400));
    }

    const timestamp = Date.now();

    userProfile.status = "INACTIVE";
    userProfile.email = `deleted_${timestamp}_${userProfile.email}`;
    if (userProfile.phone) {
      userProfile.phone = `deleted_${timestamp}_${userProfile.phone}`;
    }

    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  }
);

export const getAddresses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const userProfile = await User.findById(user._id);
    if (!userProfile) return next(createError("User not found", 404));
    res
      .status(200)
      .json({ success: true, data: userProfile.shippingAddresses || [] });
  }
);

export const addAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const {
      fullName,
      street,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault,
    } = req.body;

    const userProfile = await User.findById(user._id);
    if (!userProfile) return next(createError("User not found", 404));

    const newAddress: any = {
      fullName,
      street,
      city,
      state,
      country: country || "Nigeria",
      postalCode,
      phone,
      isDefault: !!isDefault,
    };

    if (!Array.isArray(userProfile.shippingAddresses))
      userProfile.shippingAddresses = [] as any;

    if (newAddress.isDefault) {
      userProfile.shippingAddresses = (userProfile.shippingAddresses || []).map(
        (a: any) => ({
          ...((a as any).toObject ? (a as any).toObject() : a),
          isDefault: false,
        })
      ) as any;
    }

    (userProfile.shippingAddresses as any).push(newAddress);
    await userProfile.save();

    res.status(201).json({
      success: true,
      message: "Address added",
      data: userProfile.shippingAddresses,
    });
  }
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { id } = req.params;
    const {
      fullName,
      street,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault,
    } = req.body;

    const userProfile = await User.findById(user._id);
    if (!userProfile) return next(createError("User not found", 404));
    if (!Array.isArray(userProfile.shippingAddresses))
      userProfile.shippingAddresses = [] as any;

    const idx = (userProfile.shippingAddresses || []).findIndex(
      (a: any) => a._id?.toString() === id
    );
    if (idx === -1) return next(createError("Address not found", 404));

    if (isDefault) {
      userProfile.shippingAddresses = (userProfile.shippingAddresses || []).map(
        (a: any) => ({
          ...((a as any).toObject ? (a as any).toObject() : a),
          isDefault: false,
        })
      ) as any;
    }

    const addr: any = (userProfile.shippingAddresses as any)[idx];
    if (fullName !== undefined) addr.fullName = fullName;
    if (street !== undefined) addr.street = street;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (country !== undefined) addr.country = country;
    if (postalCode !== undefined) addr.postalCode = postalCode;
    if (phone !== undefined) addr.phone = phone;
    if (isDefault !== undefined) addr.isDefault = !!isDefault;

    userProfile.markModified("shippingAddresses");
    await userProfile.save();
    res.status(200).json({
      success: true,
      message: "Address updated",
      data: userProfile.shippingAddresses,
    });
  }
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { id } = req.params;

    const userProfile = await User.findById(user._id);
    if (!userProfile) return next(createError("User not found", 404));

    userProfile.shippingAddresses = (
      (userProfile.shippingAddresses as any) || []
    ).filter((a: any) => a._id?.toString() !== id) as any;
    userProfile.markModified("shippingAddresses");
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Address deleted",
      data: userProfile.shippingAddresses,
    });
  }
);

export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { id } = req.params;

    const userProfile = await User.findById(user._id);
    if (!userProfile) return next(createError("User not found", 404));

    userProfile.shippingAddresses = (
      (userProfile.shippingAddresses as any) || []
    ).map((a: any) => ({
      ...((a as any).toObject ? (a as any).toObject() : a),
      isDefault: a._id?.toString() === id,
    })) as any;
    userProfile.markModified("shippingAddresses");
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: "Default address set",
      data: userProfile.shippingAddresses,
    });
  }
);
