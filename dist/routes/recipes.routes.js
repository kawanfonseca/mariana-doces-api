"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const schemas_1 = require("../utils/schemas");
const recipes_controller_1 = require("../controllers/recipes.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/:productId', (0, validation_middleware_1.validateRequest)(schemas_1.idParamSchema, 'params'), recipes_controller_1.getProductRecipe);
router.put('/:productId', (0, validation_middleware_1.validateRequest)(schemas_1.idParamSchema, 'params'), (0, validation_middleware_1.validateRequest)(schemas_1.productRecipeSchema), recipes_controller_1.updateProductRecipe);
router.get('/:productId/cost', (0, validation_middleware_1.validateRequest)(schemas_1.idParamSchema, 'params'), recipes_controller_1.calculateRecipeCost);
router.post('/:sourceProductId/duplicate', (0, validation_middleware_1.validateRequest)(schemas_1.idParamSchema, 'params'), recipes_controller_1.duplicateRecipe);
exports.default = router;
//# sourceMappingURL=recipes.routes.js.map