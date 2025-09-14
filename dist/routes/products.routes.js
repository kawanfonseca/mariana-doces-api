"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schemas_1 = require("../utils/schemas");
exports.productsRouter = (0, express_1.Router)();
exports.productsRouter.get('/', (0, validation_middleware_1.validateQuery)(schemas_1.paginationSchema), products_controller_1.getProducts);
exports.productsRouter.get('/pricing/preview', products_controller_1.getPricingPreview);
exports.productsRouter.get('/:id', (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), products_controller_1.getProduct);
exports.productsRouter.get('/:id/recipe', (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), products_controller_1.getProductRecipe);
exports.productsRouter.post('/', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateBody)(schemas_1.createProductSchema), products_controller_1.createProduct);
exports.productsRouter.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), (0, validation_middleware_1.validateBody)(schemas_1.updateProductSchema), products_controller_1.updateProduct);
exports.productsRouter.put('/:id/recipe', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), (0, validation_middleware_1.validateBody)(schemas_1.productRecipeSchema), products_controller_1.updateProductRecipe);
exports.productsRouter.delete('/:id', (0, auth_middleware_1.requireRole)(['ADMIN']), (0, validation_middleware_1.validateParams)(schemas_1.idParamSchema), products_controller_1.deleteProduct);
//# sourceMappingURL=products.routes.js.map