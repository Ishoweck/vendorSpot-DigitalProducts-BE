"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const categoryController_1 = require("../controllers/categoryController");
const router = (0, express_1.Router)();
router.get("/", categoryController_1.getCategories);
router.get("/:id", categoryController_1.getCategoryById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), categoryController_1.createCategory);
exports.default = router;
//# sourceMappingURL=categories.js.map