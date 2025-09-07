import { Router } from 'express';
import {
  getSummaryReport,
  getProductsReport,
  exportSummaryCSV
} from '../controllers/reports.controller';
import { validateQuery } from '../middlewares/validation.middleware';
import { dateRangeSchema } from '../utils/schemas';

export const reportsRouter = Router();

reportsRouter.get('/summary', validateQuery(dateRangeSchema), getSummaryReport);
reportsRouter.get('/products', validateQuery(dateRangeSchema), getProductsReport);
reportsRouter.get('/export/csv', validateQuery(dateRangeSchema), exportSummaryCSV);
