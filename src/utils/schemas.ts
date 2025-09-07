import { z } from 'zod';
import { SaleChannel, MovementType, MovementEntity, UserRole } from '@prisma/client';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.nativeEnum(UserRole).optional()
});

// Ingredient schemas
export const createIngredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  costPerUnit: z.number().positive('Custo deve ser positivo'),
  supplier: z.string().optional()
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
  channel: z.nativeEnum(SaleChannel),
  items: z.array(saleItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  discounts: z.number().min(0).optional(),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional()
});

// Inventory schemas
export const inventoryMovementSchema = z.object({
  type: z.nativeEnum(MovementType),
  entity: z.nativeEnum(MovementEntity),
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
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)),
  search: z.string().optional()
});

export const dateRangeSchema = z.object({
  dateFrom: z.string().refine(date => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  dateTo: z.string().refine(date => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
  channel: z.nativeEnum(SaleChannel).optional()
});

export const idParamSchema = z.object({
  id: z.string().cuid('ID inválido')
});
