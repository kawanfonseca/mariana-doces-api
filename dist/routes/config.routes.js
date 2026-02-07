"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRouter = void 0;
const express_1 = require("express");
const config_controller_1 = require("../controllers/config.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.configRouter = (0, express_1.Router)();
exports.configRouter.get('/', (0, auth_middleware_1.requireRole)(['ADMIN', 'OPERATOR']), config_controller_1.getConfigs);
exports.configRouter.put('/', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateBody)(schemas_1.configSchema), config_controller_1.updateConfig);
//# sourceMappingURL=config.routes.js.map