"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packagingRouter = void 0;
const express_1 = require("express");
const packaging_controller_1 = require("../controllers/packaging.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.packagingRouter = (0, express_1.Router)();
exports.packagingRouter.get('/', (0, validation_middleware_1.validateQuery)(schemas_1.paginationSchema), packaging_controller_1.getPackaging);
exports.packagingRouter.get('/:id', (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), packaging_controller_1.getPackagingById);
exports.packagingRouter.post('/', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateBody)(schemas_1.createPackagingSchema), packaging_controller_1.createPackaging);
exports.packagingRouter.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), (0, validation_middleware_1.validateBody)(schemas_1.updatePackagingSchema), packaging_controller_1.updatePackaging);
exports.packagingRouter.delete('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), packaging_controller_1.deletePackaging);
//# sourceMappingURL=packaging.routes.js.map