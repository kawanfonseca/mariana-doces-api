import { Router } from 'express';
import {
  getIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient
} from '../controllers/ingredients.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import {
  createIngredientSchema,
  updateIngredientSchema,
  idParamSchema,
  paginationSchema
} from '../utils/schemas';

export const ingredientsRouter = Router();

ingredientsRouter.get('/', validateQuery(paginationSchema), getIngredients);
ingredientsRouter.get('/:id', validateParams(idParamSchema), getIngredient);
ingredientsRouter.post('/', requireRole(['ADMIN']), validateBody(createIngredientSchema), createIngredient);
ingredientsRouter.put('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), validateBody(updateIngredientSchema), updateIngredient);
ingredientsRouter.delete('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), deleteIngredient);
