import { Router } from 'express';
import {
  getPackaging,
  getPackagingById,
  createPackaging,
  updatePackaging,
  deletePackaging
} from '../controllers/packaging.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import {
  createPackagingSchema,
  updatePackagingSchema,
  idParamSchema,
  paginationSchema
} from '../utils/schemas';

export const packagingRouter = Router();

packagingRouter.get('/', validateQuery(paginationSchema), getPackaging);
packagingRouter.get('/:id', validateParams(idParamSchema), getPackagingById);
packagingRouter.post('/', requireRole(['ADMIN']), validateBody(createPackagingSchema), createPackaging);
packagingRouter.put('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), validateBody(updatePackagingSchema), updatePackaging);
packagingRouter.delete('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), deletePackaging);
