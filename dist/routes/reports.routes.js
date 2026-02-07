"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.get('/summary', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateQuery)(schemas_1.dateRangeSchema), reports_controller_1.getSummaryReport);
exports.reportsRouter.get('/products', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateQuery)(schemas_1.dateRangeSchema), reports_controller_1.getProductsReport);
exports.reportsRouter.get('/export/csv', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateQuery)(schemas_1.dateRangeSchema), reports_controller_1.exportSummaryCSV);
//# sourceMappingURL=reports.routes.js.map