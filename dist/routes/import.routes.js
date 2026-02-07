"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRouter = void 0;
const express_1 = require("express");
const import_controller_1 = require("../controllers/import.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.importRouter = (0, express_1.Router)();
exports.importRouter.post('/sales-csv', (0, auth_middleware_1.requireRole)(['ADMIN']), import_controller_1.uploadMiddleware, import_controller_1.importSalesCSV);
//# sourceMappingURL=import.routes.js.map