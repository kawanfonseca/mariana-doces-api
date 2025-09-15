"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const schemas_1 = require("../utils/schemas");
const stock_controller_1 = require("../controllers/stock.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/movements', stock_controller_1.getStockMovements);
router.get('/movements/:id', stock_controller_1.getStockMovement);
router.post('/movements', (0, validation_middleware_1.validateRequest)(schemas_1.createStockMovementSchema), stock_controller_1.createStockMovement);
router.get('/status', stock_controller_1.getInventoryStatus);
router.get('/alerts', stock_controller_1.getStockAlerts);
router.get('/cost-analysis', stock_controller_1.getCostAnalysis);
exports.default = router;
//# sourceMappingURL=stock.routes.js.map