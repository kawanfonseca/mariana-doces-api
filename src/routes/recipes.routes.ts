import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { productRecipeSchema, idParamSchema } from '../utils/schemas';
import {
  getProductRecipe,
  updateProductRecipe,
  calculateRecipeCost,
  duplicateRecipe
} from '../controllers/recipes.controller';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para receitas de produtos
router.get('/:productId', validateRequest(idParamSchema, 'params'), getProductRecipe);
router.put('/:productId', 
  validateRequest(idParamSchema, 'params'),
  validateRequest(productRecipeSchema),
  updateProductRecipe
);

// Rotas para análise de custos
router.get('/:productId/cost', validateRequest(idParamSchema, 'params'), calculateRecipeCost);

// Rota para duplicar receita
router.post('/:sourceProductId/duplicate', 
  validateRequest(idParamSchema, 'params'),
  duplicateRecipe
);

export default router;
