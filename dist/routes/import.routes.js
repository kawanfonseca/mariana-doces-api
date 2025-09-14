"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRouter = void 0;
const express_1 = require("express");
const import_controller_1 = require("../controllers/import.controller");
exports.importRouter = (0, express_1.Router)();
exports.importRouter.post('/sales-csv', import_controller_1.uploadMiddleware, import_controller_1.importSalesCSV);
//# sourceMappingURL=import.routes.js.map