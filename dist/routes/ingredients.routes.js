"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingredientsRouter = void 0;
const express_1 = require("express");
const ingredients_controller_1 = require("../controllers/ingredients.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.ingredientsRouter = (0, express_1.Router)();
exports.ingredientsRouter.get('/', (0, validation_middleware_1.validateQuery)(schemas_1.paginationSchema), ingredients_controller_1.getIngredients);
exports.ingredientsRouter.get('/:id', (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), ingredients_controller_1.getIngredient);
exports.ingredientsRouter.post('/', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateBody)(schemas_1.createIngredientSchema), ingredients_controller_1.createIngredient);
exports.ingredientsRouter.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), (0, validation_middleware_1.validateBody)(schemas_1.updateIngredientSchema), ingredients_controller_1.updateIngredient);
exports.ingredientsRouter.delete('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), ingredients_controller_1.deleteIngredient);
//# sourceMappingURL=ingredients.routes.js.map