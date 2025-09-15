"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const inventory_reports_controller_1 = require("../controllers/inventory-reports.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/movements', inventory_reports_controller_1.getStockMovementsReport);
router.get('/movements/export', inventory_reports_controller_1.exportInventoryCSV);
router.get('/value', inventory_reports_controller_1.getInventoryValueReport);
router.get('/most-used', inventory_reports_controller_1.getMostUsedIngredientsReport);
router.get('/turnover', inventory_reports_controller_1.getStockTurnoverReport);
router.get('/forecast', inventory_reports_controller_1.getStockForecastReport);
exports.default = router;
//# sourceMappingURL=inventory-reports.routes.js.map