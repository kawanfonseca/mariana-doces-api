import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductRecipe,
  updateProductRecipe,
  getPricingPreview
} from '../controllers/products.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productRecipeSchema,
  idParamSchema,
  paginationSchema
} from '../utils/schemas';

export const productsRouter = Router();

productsRouter.get('/', validateQuery(paginationSchema), getProducts);
productsRouter.get('/pricing/preview', getPricingPreview);
productsRouter.get('/:id', validateParams(idParamSchema), getProduct);
productsRouter.get('/:id/recipe', validateParams(idParamSchema), getProductRecipe);

productsRouter.post('/', requireRole(['ADMIN']), validateBody(createProductSchema), createProduct);
productsRouter.put('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), validateBody(updateProductSchema), updateProduct);
productsRouter.put('/:id/recipe', requireRole(['ADMIN']), validateParams(idParamSchema), validateBody(productRecipeSchema), updateProductRecipe);
productsRouter.delete('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), deleteProduct);
