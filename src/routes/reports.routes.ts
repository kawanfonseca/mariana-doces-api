import { Router } from 'express';
import {
  getSummaryReport,
  getProductsReport,
  exportSummaryCSV
} from '../controllers/reports.controller';
import { validateQuery } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { dateRangeSchema } from '../utils/schemas';

export const reportsRouter = Router();

reportsRouter.get('/summary', requireRole(['ADMIN']), validateQuery(dateRangeSchema), getSummaryReport);
reportsRouter.get('/products', requireRole(['ADMIN']), validateQuery(dateRangeSchema), getProductsReport);
reportsRouter.get('/export/csv', requireRole(['ADMIN']), validateQuery(dateRangeSchema), exportSummaryCSV);
