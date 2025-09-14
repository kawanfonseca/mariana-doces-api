"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', (0, validation_middleware_1.validateBody)(schemas_1.loginSchema), auth_controller_1.login);
exports.authRouter.post('/register', (0, validation_middleware_1.validateBody)(schemas_1.createUserSchema), auth_controller_1.register);
exports.authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.me);
//# sourceMappingURL=auth.routes.js.map