import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as Admincontrollers from "../controllers/AdminController"; 


const router: Router = Router();

// router.use(authenticate);
// router.use(authorize("ADMIN"));

// router.get("/dashboard", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Admin dashboard data retrieved successfully",
//     data: {
//       totalUsers: 0,
//       totalVendors: 0,
//       totalProducts: 0,
//       totalOrders: 0,
//       recentActivity: [],
//     },
//   });
// });

// router.get("/users", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Users retrieved successfully",
//     data: [],
//     pagination: {
//       total: 0,
//       page: 1,
//       limit: 10,
//       totalPages: 0,
//     },
//   });
// });

// router.get("/vendors", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Vendors retrieved successfully",
//     data: [],
//     pagination: {
//       total: 0,
//       page: 1,
//       limit: 10,
//       totalPages: 0,
//     },
//   });
// });


router.get("/users", Admincontrollers.getAllUsers);
router.get("/users/:id", Admincontrollers.getUserById); 

// VENDORS
router.get("/vendors", Admincontrollers.getAllVendors);
router.get("/vendors/:id", Admincontrollers.getVendorById); 
router.patch("/vendors/:vendorId/verification", Admincontrollers.updateVendorVerification);

// WALLET
router.get("/wallet", Admincontrollers.getWalletByUserId);
router.get("/wallet/:userId", Admincontrollers.getWalletDetails);

// REVIEWS
router.get("/reviews/moderation", Admincontrollers.getReviewsForModeration);
router.patch("/reviews/:reviewId/moderate", Admincontrollers.moderateReview);

// PRODUCTS
router.get("/products", Admincontrollers.getProducts);
router.get("/products/:productId", Admincontrollers.getProductById);
router.patch("/products/:productId/approval", Admincontrollers.updateProductApproval);
router.patch("/products/:productId/status", Admincontrollers.updateProductStatus);

// PAYMENTS
router.get("/payments", Admincontrollers.getPayments);
router.get("/payments/:paymentId", Admincontrollers.getPaymentById);
router.patch("/payments/:paymentId/status", Admincontrollers.updatePaymentStatus);

// ORDERS
router.get("/orders", Admincontrollers.getOrders);
router.get("/orders/:orderId", Admincontrollers.getOrderById);
router.patch("/orders/:orderId/status", Admincontrollers.updateOrderStatus);

// CATEGORIES
router.post("/categories", Admincontrollers.createCategory);
router.get("/categories", Admincontrollers.getCategories);
router.get("/categories/:id", Admincontrollers.getCategoryById);
router.patch("/categories/:id", Admincontrollers.updateCategory);
router.delete("/categories/:id", Admincontrollers.deleteCategory);



export default router;
