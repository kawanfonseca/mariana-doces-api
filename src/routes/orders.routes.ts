import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} from '../controllers/orders.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import {
  createSaleOrderSchema,
  idParamSchema,
  dateRangeSchema
} from '../utils/schemas';

export const ordersRouter = Router();

ordersRouter.get('/', validateQuery(dateRangeSchema), getOrders);
ordersRouter.get('/:id', validateParams(idParamSchema), getOrder);
ordersRouter.post('/', requireRole(['ADMIN', 'OPERATOR']), validateBody(createSaleOrderSchema), createOrder);
ordersRouter.put('/:id', requireRole(['ADMIN', 'OPERATOR']), validateParams(idParamSchema), updateOrder);
ordersRouter.delete('/:id', requireRole(['ADMIN', 'OPERATOR']), validateParams(idParamSchema), deleteOrder);
