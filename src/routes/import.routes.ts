import { Router } from 'express';
import { importSalesCSV, uploadMiddleware } from '../controllers/import.controller';
import { requireRole } from '../middlewares/auth.middleware';

export const importRouter = Router();

importRouter.post('/sales-csv', requireRole(['ADMIN']), uploadMiddleware, importSalesCSV);
