"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)("ADMIN"));
router.get("/dashboard", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin dashboard data retrieved successfully",
        data: {
            totalUsers: 0,
            totalVendors: 0,
            totalProducts: 0,
            totalOrders: 0,
            recentActivity: [],
        },
    });
});
router.get("/users", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        },
    });
});
router.get("/vendors", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Vendors retrieved successfully",
        data: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        },
    });
});
exports.default = router;
//# sourceMappingURL=admin.js.map