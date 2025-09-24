"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.post('/', (0, validation_middleware_1.validateBody)(schemas_1.createUserSchema), users_controller_1.createUser);
exports.usersRouter.get('/', (0, auth_middleware_1.requireRole)(['ADMIN']), users_controller_1.listUsers);
exports.usersRouter.get('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), users_controller_1.getUserById);
exports.usersRouter.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), users_controller_1.updateUser);
exports.usersRouter.delete('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), users_controller_1.deleteUser);
//# sourceMappingURL=users.routes.js.map