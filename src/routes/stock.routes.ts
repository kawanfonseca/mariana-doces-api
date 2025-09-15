import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validation.middleware';
import { createStockMovementSchema } from '../utils/schemas';
import {
  getStockMovements,
  getStockMovement,
  createStockMovement,
  getInventoryStatus,
  getStockAlerts,
  getCostAnalysis
} from '../controllers/stock.controller';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para movimentações de estoque
router.get('/movements', getStockMovements);
router.get('/movements/:id', getStockMovement);
router.post('/movements', validateRequest(createStockMovementSchema), createStockMovement);

// Rotas para análise de estoque
router.get('/status', getInventoryStatus);
router.get('/alerts', getStockAlerts);

// Rotas para análise de custos
router.get('/cost-analysis', getCostAnalysis);

export default router;
