"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.deleteAccount = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = exports.removeFromWishlist = exports.addToWishlist = exports.getUserWishlist = exports.getUserDashboard = exports.changePassword = exports.uploadAvatar = exports.updateProfile = exports.getProfile = void 0;
const User_1 = require("../models/User");
const Order_1 = require("../models/Order");
const Review_1 = require("../models/Review");
const Product_1 = require("../models/Product");
const cloudinaryService_1 = require("../services/cloudinaryService");
const errorHandler_1 = require("../middleware/errorHandler");
const NotificationController_1 = require("./NotificationController");
const Vendor_1 = require("../models/Vendor");
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const userProfile = await User_1.User.findById(user._id).select("-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires");
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    let vendorId = undefined;
    if (userProfile.role === "VENDOR") {
        const vendor = await Vendor_1.Vendor.findOne({ userId: user._id }).select("_id");
        vendorId = vendor?._id;
    }
    const profileObj = userProfile.toObject
        ? userProfile.toObject()
        : userProfile;
    if (vendorId)
        profileObj.vendorId = vendorId;
    res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: profileObj,
    });
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { firstName, lastName, phone, dateOfBirth, gender, address, city, state, country, postalCode, } = req.body;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (phone) {
        const phoneStr = String(phone).trim();
        const e164 = /^\+?[1-9]\d{9,14}$/;
        if (!e164.test(phoneStr)) {
            return next((0, errorHandler_1.createError)("Enter a valid phone number", 400));
        }
        const existingUser = await User_1.User.findOne({
            phone: phoneStr,
            _id: { $ne: user._id },
        });
        if (existingUser) {
            return next((0, errorHandler_1.createError)("This phone number is already registered by another user", 400));
        }
        userProfile.phone = phoneStr;
    }
    if (firstName)
        userProfile.firstName = firstName;
    if (lastName)
        userProfile.lastName = lastName;
    if (dateOfBirth)
        userProfile.dateOfBirth = new Date(dateOfBirth);
    if (gender)
        userProfile.gender = gender;
    if (address)
        userProfile.address = address;
    if (city)
        userProfile.city = city;
    if (state)
        userProfile.state = state;
    if (country)
        userProfile.country = country;
    if (postalCode)
        userProfile.postalCode = postalCode;
    await userProfile.save();
    try {
        await (0, NotificationController_1.createNotification)({
            userId: String(user._id),
            type: "PROFILE_UPDATED",
            title: "Profile Updated Successfully",
            message: "Your profile has been updated successfully.",
            category: "ACCOUNT",
            priority: "NORMAL",
            channels: ["IN_APP"],
        });
    }
    catch (error) {
        console.error("Failed to create profile update notification:", error);
    }
    const updatedUser = await User_1.User.findById(user._id).select("-password -passwordResetToken -passwordResetExpires -emailVerificationOTP -emailVerificationOTPExpires");
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
    });
});
exports.uploadAvatar = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    if (!req.file) {
        return next((0, errorHandler_1.createError)("Please upload an image file", 400));
    }
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    try {
        const uploadResult = await cloudinaryService_1.cloudinaryService.uploadFile(req.file, "avatars");
        if (userProfile.avatar) {
            const publicId = cloudinaryService_1.cloudinaryService.extractPublicId(userProfile.avatar);
            if (publicId) {
                await cloudinaryService_1.cloudinaryService.deleteFile(publicId);
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
    }
    catch (error) {
        console.error("Avatar upload error:", error);
        return next((0, errorHandler_1.createError)("Failed to upload avatar", 500));
    }
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next((0, errorHandler_1.createError)("Current password and new password are required", 400));
    }
    if (newPassword.length < 6) {
        return next((0, errorHandler_1.createError)("New password must be at least 6 characters", 400));
    }
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    const isCurrentPasswordValid = await userProfile.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return next((0, errorHandler_1.createError)("Current password is incorrect", 400));
    }
    userProfile.password = newPassword;
    await userProfile.save();
    try {
        await (0, NotificationController_1.createNotification)({
            userId: String(user._id),
            type: "PASSWORD_CHANGED",
            title: "Password Changed",
            message: "Your password has been changed successfully. If you didn't make this change, please contact support immediately.",
            category: "SECURITY",
            priority: "HIGH",
            channels: ["IN_APP", "EMAIL"],
        });
    }
    catch (error) {
        console.error("Failed to create password change notification:", error);
    }
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});
exports.getUserDashboard = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const totalOrders = await Order_1.Order.countDocuments({ userId: user._id });
    const completedOrders = await Order_1.Order.countDocuments({
        userId: user._id,
        status: "DELIVERED",
    });
    const pendingOrders = await Order_1.Order.countDocuments({
        userId: user._id,
        status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    });
    const totalSpent = await Order_1.Order.aggregate([
        { $match: { userId: user._id, paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const recentOrders = await Order_1.Order.find({ userId: user._id })
        .populate({
        path: "items.productId",
        select: "name thumbnail",
    })
        .sort({ createdAt: -1 })
        .limit(5);
    const totalReviews = await Review_1.Review.countDocuments({ userId: user._id });
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
});
exports.getUserWishlist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const userProfile = await User_1.User.findById(user._id).populate({
        path: "wishlist",
        select: "name price thumbnail vendorId categoryId",
        populate: [
            { path: "vendorId", select: "businessName" },
            { path: "categoryId", select: "name" },
        ],
    });
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
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
});
exports.addToWishlist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId } = req.body;
    if (!productId) {
        return next((0, errorHandler_1.createError)("Product ID is required", 400));
    }
    const product = await Product_1.Product.findById(productId);
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (!userProfile.wishlist) {
        userProfile.wishlist = [];
    }
    if (userProfile.wishlist.includes(productId)) {
        return next((0, errorHandler_1.createError)("Product already in wishlist", 400));
    }
    userProfile.wishlist.push(productId);
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Product added to wishlist",
    });
});
exports.removeFromWishlist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (!userProfile.wishlist) {
        userProfile.wishlist = [];
    }
    const index = userProfile.wishlist.findIndex((id) => id.toString() === productId);
    if (index === -1) {
        return next((0, errorHandler_1.createError)("Product not in wishlist", 404));
    }
    userProfile.wishlist.splice(index, 1);
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
    });
});
exports.getCart = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const userProfile = await User_1.User.findById(user._id).populate({
        path: "cart.items.productId",
        select: "name price thumbnail vendorId categoryId",
        populate: [
            { path: "vendorId", select: "businessName" },
            { path: "categoryId", select: "name" },
        ],
    });
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    const cart = userProfile.cart || { items: [] };
    res.status(200).json({
        success: true,
        data: cart,
    });
});
exports.addToCart = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
        return next((0, errorHandler_1.createError)("Product ID is required", 400));
    }
    if (quantity < 1) {
        return next((0, errorHandler_1.createError)("Quantity must be at least 1", 400));
    }
    const product = await Product_1.Product.findById(productId);
    if (!product) {
        return next((0, errorHandler_1.createError)("Product not found", 404));
    }
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (!userProfile.cart) {
        userProfile.cart = { items: [] };
    }
    const existingItemIndex = userProfile.cart.items.findIndex((item) => item.productId.toString() === productId);
    if (existingItemIndex !== -1) {
        userProfile.cart.items[existingItemIndex].quantity += quantity;
    }
    else {
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
});
exports.updateCartItem = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
        return next((0, errorHandler_1.createError)("Valid quantity is required", 400));
    }
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (!userProfile.cart) {
        return next((0, errorHandler_1.createError)("Cart is empty", 404));
    }
    const itemIndex = userProfile.cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
        return next((0, errorHandler_1.createError)("Product not in cart", 404));
    }
    if (quantity === 0) {
        userProfile.cart.items.splice(itemIndex, 1);
    }
    else {
        userProfile.cart.items[itemIndex].quantity = quantity;
    }
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: quantity === 0 ? "Product removed from cart" : "Cart item updated",
    });
});
exports.removeFromCart = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    if (!userProfile.cart) {
        return next((0, errorHandler_1.createError)("Cart is empty", 404));
    }
    const itemIndex = userProfile.cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
        return next((0, errorHandler_1.createError)("Product not in cart", 404));
    }
    userProfile.cart.items.splice(itemIndex, 1);
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Product removed from cart",
    });
});
exports.clearCart = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    userProfile.cart = { items: [] };
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Cart cleared",
    });
});
exports.deleteAccount = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { password } = req.body;
    if (!password) {
        return next((0, errorHandler_1.createError)("Password is required to delete account", 400));
    }
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile) {
        return next((0, errorHandler_1.createError)("User not found", 404));
    }
    const isPasswordValid = await userProfile.comparePassword(password);
    if (!isPasswordValid) {
        return next((0, errorHandler_1.createError)("Password is incorrect", 400));
    }
    const hasActiveOrders = await Order_1.Order.countDocuments({
        userId: user._id,
        status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    });
    if (hasActiveOrders > 0) {
        return next((0, errorHandler_1.createError)("Cannot delete account with active orders", 400));
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
});
exports.getAddresses = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile)
        return next((0, errorHandler_1.createError)("User not found", 404));
    res
        .status(200)
        .json({ success: true, data: userProfile.shippingAddresses || [] });
});
exports.addAddress = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { fullName, street, city, state, country, postalCode, phone, isDefault, } = req.body;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile)
        return next((0, errorHandler_1.createError)("User not found", 404));
    const newAddress = {
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
        userProfile.shippingAddresses = [];
    if (newAddress.isDefault) {
        userProfile.shippingAddresses = (userProfile.shippingAddresses || []).map((a) => ({
            ...(a.toObject ? a.toObject() : a),
            isDefault: false,
        }));
    }
    userProfile.shippingAddresses.push(newAddress);
    await userProfile.save();
    res.status(201).json({
        success: true,
        message: "Address added",
        data: userProfile.shippingAddresses,
    });
});
exports.updateAddress = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    const { fullName, street, city, state, country, postalCode, phone, isDefault, } = req.body;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile)
        return next((0, errorHandler_1.createError)("User not found", 404));
    if (!Array.isArray(userProfile.shippingAddresses))
        userProfile.shippingAddresses = [];
    const idx = (userProfile.shippingAddresses || []).findIndex((a) => a._id?.toString() === id);
    if (idx === -1)
        return next((0, errorHandler_1.createError)("Address not found", 404));
    if (isDefault) {
        userProfile.shippingAddresses = (userProfile.shippingAddresses || []).map((a) => ({
            ...(a.toObject ? a.toObject() : a),
            isDefault: false,
        }));
    }
    const addr = userProfile.shippingAddresses[idx];
    if (fullName !== undefined)
        addr.fullName = fullName;
    if (street !== undefined)
        addr.street = street;
    if (city !== undefined)
        addr.city = city;
    if (state !== undefined)
        addr.state = state;
    if (country !== undefined)
        addr.country = country;
    if (postalCode !== undefined)
        addr.postalCode = postalCode;
    if (phone !== undefined)
        addr.phone = phone;
    if (isDefault !== undefined)
        addr.isDefault = !!isDefault;
    userProfile.markModified("shippingAddresses");
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Address updated",
        data: userProfile.shippingAddresses,
    });
});
exports.deleteAddress = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile)
        return next((0, errorHandler_1.createError)("User not found", 404));
    userProfile.shippingAddresses = (userProfile.shippingAddresses || []).filter((a) => a._id?.toString() !== id);
    userProfile.markModified("shippingAddresses");
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Address deleted",
        data: userProfile.shippingAddresses,
    });
});
exports.setDefaultAddress = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    const userProfile = await User_1.User.findById(user._id);
    if (!userProfile)
        return next((0, errorHandler_1.createError)("User not found", 404));
    userProfile.shippingAddresses = (userProfile.shippingAddresses || []).map((a) => ({
        ...(a.toObject ? a.toObject() : a),
        isDefault: a._id?.toString() === id,
    }));
    userProfile.markModified("shippingAddresses");
    await userProfile.save();
    res.status(200).json({
        success: true,
        message: "Default address set",
        data: userProfile.shippingAddresses,
    });
});
//# sourceMappingURL=UserController.js.map