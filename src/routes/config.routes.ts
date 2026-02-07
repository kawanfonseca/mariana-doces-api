import { Router } from 'express';
import { getConfigs, updateConfig } from '../controllers/config.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { configSchema } from '../utils/schemas';

export const configRouter = Router();

configRouter.get('/', requireRole(['ADMIN', 'OPERATOR']), getConfigs);
configRouter.put('/', requireRole(['ADMIN']), validateBody(configSchema), updateConfig);
