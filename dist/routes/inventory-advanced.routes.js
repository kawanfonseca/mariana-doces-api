"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const inventory_advanced_controller_1 = require("../controllers/inventory-advanced.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/bulk-adjustment', inventory_advanced_controller_1.bulkStockAdjustment);
router.post('/transfer', inventory_advanced_controller_1.transferStock);
router.post('/consume', inventory_advanced_controller_1.consumeIngredientsForProduction);
router.post('/auto-restock', inventory_advanced_controller_1.autoRestock);
router.get('/ingredient/:ingredientId/history', inventory_advanced_controller_1.getIngredientHistory);
router.get('/expiring', inventory_advanced_controller_1.getExpiringIngredients);
exports.default = router;
//# sourceMappingURL=inventory-advanced.routes.js.map