import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validation.middleware';
import {
  bulkStockAdjustment,
  transferStock,
  consumeIngredientsForProduction,
  autoRestock,
  getIngredientHistory,
  getExpiringIngredients
} from '../controllers/inventory-advanced.controller';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Operações avançadas de estoque
router.post('/bulk-adjustment', bulkStockAdjustment);
router.post('/transfer', transferStock);
router.post('/consume', consumeIngredientsForProduction);
router.post('/auto-restock', autoRestock);

// Histórico e relatórios
router.get('/ingredient/:ingredientId/history', getIngredientHistory);
router.get('/expiring', getExpiringIngredients);

export default router;
