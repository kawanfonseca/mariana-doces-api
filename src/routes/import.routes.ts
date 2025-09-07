import { Router } from 'express';
import { importSalesCSV, uploadMiddleware } from '../controllers/import.controller';

export const importRouter = Router();

importRouter.post('/sales-csv', uploadMiddleware, importSalesCSV);
