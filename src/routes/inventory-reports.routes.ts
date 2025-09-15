import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getStockMovementsReport,
  getInventoryValueReport,
  getMostUsedIngredientsReport,
  getStockForecastReport,
  exportInventoryCSV,
  getStockTurnoverReport
} from '../controllers/inventory-reports.controller';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Relatórios de movimentações
router.get('/movements', getStockMovementsReport);
router.get('/movements/export', exportInventoryCSV);

// Relatórios de valor em estoque
router.get('/value', getInventoryValueReport);

// Relatórios de uso
router.get('/most-used', getMostUsedIngredientsReport);
router.get('/turnover', getStockTurnoverReport);

// Relatórios de previsão
router.get('/forecast', getStockForecastReport);

export default router;
