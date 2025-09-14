"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.dateRangeSchema = exports.paginationSchema = exports.configSchema = exports.inventoryMovementSchema = exports.createSaleOrderSchema = exports.saleItemSchema = exports.productRecipeSchema = exports.laborCostPresetSchema = exports.packagingUsageSchema = exports.recipeItemSchema = exports.updateProductSchema = exports.createProductSchema = exports.updatePackagingSchema = exports.createPackagingSchema = exports.updateIngredientSchema = exports.createIngredientSchema = exports.createUserSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    role: zod_1.z.enum(['ADMIN', 'OPERATOR']).optional()
});
exports.createIngredientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    unit: zod_1.z.string().min(1, 'Unidade é obrigatória'),
    costPerUnit: zod_1.z.number().positive('Custo deve ser positivo'),
    supplier: zod_1.z.string().optional()
});
exports.updateIngredientSchema = exports.createIngredientSchema.partial().extend({
    active: zod_1.z.boolean().optional()
});
exports.createPackagingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    unitCost: zod_1.z.number().positive('Custo deve ser positivo')
});
exports.updatePackagingSchema = exports.createPackagingSchema.partial().extend({
    active: zod_1.z.boolean().optional()
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    channelBasePriceDirect: zod_1.z.number().positive().optional(),
    channelBasePriceIFood: zod_1.z.number().positive().optional()
});
exports.updateProductSchema = exports.createProductSchema.partial().extend({
    active: zod_1.z.boolean().optional()
});
exports.recipeItemSchema = zod_1.z.object({
    ingredientId: zod_1.z.string().cuid('ID do ingrediente inválido'),
    qty: zod_1.z.number().positive('Quantidade deve ser positiva'),
    wastePct: zod_1.z.number().min(0).max(100).optional()
});
exports.packagingUsageSchema = zod_1.z.object({
    packagingId: zod_1.z.string().cuid('ID da embalagem inválido'),
    qty: zod_1.z.number().positive('Quantidade deve ser positiva')
});
exports.laborCostPresetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    minutesPerBatch: zod_1.z.number().positive('Minutos por lote deve ser positivo'),
    batchYield: zod_1.z.number().positive('Rendimento do lote deve ser positivo'),
    laborRatePerHour: zod_1.z.number().positive('Taxa por hora deve ser positiva')
});
exports.productRecipeSchema = zod_1.z.object({
    recipeItems: zod_1.z.array(exports.recipeItemSchema),
    packagingUsages: zod_1.z.array(exports.packagingUsageSchema),
    laborCostPreset: exports.laborCostPresetSchema.optional()
});
exports.saleItemSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid().optional(),
    variantId: zod_1.z.string().cuid().optional(),
    qty: zod_1.z.number().positive('Quantidade deve ser positiva'),
    unitPrice: zod_1.z.number().positive('Preço unitário deve ser positivo')
}).refine(data => data.productId || data.variantId, {
    message: 'Produto ou variante deve ser informado'
});
exports.createSaleOrderSchema = zod_1.z.object({
    date: zod_1.z.string().refine(date => !isNaN(Date.parse(date)), 'Data inválida'),
    channel: zod_1.z.enum(['DIRECT', 'IFOOD']),
    items: zod_1.z.array(exports.saleItemSchema).min(1, 'Pelo menos um item é obrigatório'),
    discounts: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().optional(),
    customerName: zod_1.z.string().optional(),
    customerPhone: zod_1.z.string().optional()
});
exports.inventoryMovementSchema = zod_1.z.object({
    type: zod_1.z.enum(['IN', 'OUT', 'ADJUST']),
    entity: zod_1.z.enum(['INGREDIENT', 'PACKAGING', 'PRODUCT']),
    entityId: zod_1.z.string().cuid('ID da entidade inválido'),
    qty: zod_1.z.number().positive('Quantidade deve ser positiva'),
    unit: zod_1.z.string().min(1, 'Unidade é obrigatória'),
    unitCost: zod_1.z.number().positive().optional(),
    note: zod_1.z.string().optional(),
    date: zod_1.z.string().refine(date => !isNaN(Date.parse(date)), 'Data inválida').optional()
});
exports.configSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Chave é obrigatória'),
    value: zod_1.z.string().min(1, 'Valor é obrigatório'),
    description: zod_1.z.string().optional()
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().transform(val => parseInt(val) || 1),
    limit: zod_1.z.string().transform(val => Math.min(parseInt(val) || 20, 100)),
    search: zod_1.z.string().optional()
});
exports.dateRangeSchema = zod_1.z.object({
    dateFrom: zod_1.z.string().refine(date => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
    dateTo: zod_1.z.string().refine(date => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
    channel: zod_1.z.enum(['DIRECT', 'IFOOD']).optional()
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('ID inválido')
});
//# sourceMappingURL=schemas.js.map