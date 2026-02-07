"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const orders_controller_1 = require("../controllers/orders.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.ordersRouter = (0, express_1.Router)();
exports.ordersRouter.get('/', (0, validation_middleware_1.validateQuery)(schemas_1.dateRangeSchema), orders_controller_1.getOrders);
exports.ordersRouter.get('/:id', (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), orders_controller_1.getOrder);
exports.ordersRouter.post('/', (0, auth_middleware_1.requireRole)(['ADMIN', 'OPERATOR']), (0, validation_middleware_1.validateBody)(schemas_1.createSaleOrderSchema), orders_controller_1.createOrder);
exports.ordersRouter.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN', 'OPERATOR']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), orders_controller_1.updateOrder);
exports.ordersRouter.delete('/:id', (0, auth_middleware_1.requireRole)(['ADMIN', 'OPERATOR']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), orders_controller_1.deleteOrder);
//# sourceMappingURL=orders.routes.js.map