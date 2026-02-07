import { z } from 'zod';
import { SaleChannel, MovementType, MovementEntity, UserRole } from '../types';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['ADMIN', 'OPERATOR']).optional()
});

// Ingredient schemas
export const createIngredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  costPerUnit: z.number().positive('Custo deve ser positivo'),
  supplier: z.string().optional(),
  currentStock: z.number().min(0, 'Estoque atual deve ser positivo').optional(),
  minStock: z.number().min(0, 'Estoque mínimo deve ser positivo').optional()
});

export const updateIngredientSchema = createIngredientSchema.partial().extend({
  active: z.boolean().optional()
});

// Packaging schemas
export const createPackagingSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unitCost: z.number().positive('Custo deve ser positivo')
});

export const updatePackagingSchema = createPackagingSchema.partial().extend({
  active: z.boolean().optional()
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  channelBasePriceDirect: z.number().positive().optional(),
  channelBasePriceIFood: z.number().positive().optional()
});

export const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional()
});

// Recipe schemas
export const recipeItemSchema = z.object({
  ingredientId: z.string().cuid('ID do ingrediente inválido'),
  qty: z.number().positive('Quantidade deve ser positiva'),
  wastePct: z.number().min(0).max(100).optional()
});

export const packagingUsageSchema = z.object({
  packagingId: z.string().cuid('ID da embalagem inválido'),
  qty: z.number().positive('Quantidade deve ser positiva')
});

export const laborCostPresetSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  minutesPerBatch: z.number().positive('Minutos por lote deve ser positivo'),
  batchYield: z.number().positive('Rendimento do lote deve ser positivo'),
  laborRatePerHour: z.number().positive('Taxa por hora deve ser positiva')
});

export const productRecipeSchema = z.object({
  recipeItems: z.array(recipeItemSchema),
  packagingUsages: z.array(packagingUsageSchema),
  laborCostPreset: laborCostPresetSchema.optional()
});

// Sale order schemas
export const saleItemSchema = z.object({
  productId: z.string().cuid().optional(),
  variantId: z.string().cuid().optional(),
  qty: z.number().positive('Quantidade deve ser positiva'),
  unitPrice: z.number().positive('Preço unitário deve ser positivo')
}).refine(data => data.productId || data.variantId, {
  message: 'Produto ou variante deve ser informado'
});

export const createSaleOrderSchema = z.object({
  date: z.string().refine(date => !isNaN(Date.parse(date)), 'Data inválida'),
  channel: z.enum(['DIRECT', 'IFOOD']),
  items: z.array(saleItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  discounts: z.number().min(0).optional(),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional()
});

// Inventory schemas
export const inventoryMovementSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  entity: z.enum(['INGREDIENT', 'PACKAGING', 'PRODUCT']),
  entityId: z.string().cuid('ID da entidade inválido'),
  qty: z.number().positive('Quantidade deve ser positiva'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  unitCost: z.number().positive().optional(),
  note: z.string().optional(),
  date: z.string().refine(date => !isNaN(Date.parse(date)), 'Data inválida').optional()
});

// Config schemas
export const configSchema = z.object({
  key: z.string().min(1, 'Chave é obrigatória'),
  value: z.string().min(1, 'Valor é obrigatório'),
  description: z.string().optional()
});

// Query schemas
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(val => Math.max(1, parseInt(val) || 1)),
  limit: z.string().optional().default('20').transform(val => Math.min(Math.max(1, parseInt(val) || 20), 100)),
  search: z.string().optional()
});

export const dateRangeSchema = z.object({
  dateFrom: z.string().refine(date => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  dateTo: z.string().refine(date => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
  channel: z.enum(['DIRECT', 'IFOOD']).optional(),
  page: z.string().optional(),
  limit: z.string().optional()
}).passthrough().refine(data => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, { message: 'Data inicial deve ser anterior ou igual à data final', path: ['dateTo'] });

export const idParamSchema = z.object({
  id: z.string().cuid('ID inválido')
});

// Stock movement schemas
export const createStockMovementSchema = z.object({
  ingredientId: z.string().cuid('ID do ingrediente inválido'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    errorMap: () => ({ message: 'Tipo deve ser IN, OUT ou ADJUSTMENT' })
  }),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional(),
  date: z.string().refine(date => !isNaN(Date.parse(date)), 'Data inválida').optional()
});
