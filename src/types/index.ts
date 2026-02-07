import { Request } from 'express';
// Tipos temporários até o Prisma Client ser gerado corretamente
export type UserRole = 'ADMIN' | 'OPERATOR';
export type SaleChannel = 'DIRECT' | 'IFOOD';
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type MovementEntity = 'INGREDIENT' | 'PACKAGING' | 'PRODUCT';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  currentStock?: number;
  minStock?: number;
}

export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {
  active?: boolean;
}

export interface CreatePackagingDto {
  name: string;
  unitCost: number;
}

export interface UpdatePackagingDto extends Partial<CreatePackagingDto> {
  active?: boolean;
}

export interface CreateProductDto {
  name: string;
  channelBasePriceDirect?: number;
  channelBasePriceIFood?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  active?: boolean;
}

export interface RecipeItemDto {
  ingredientId: string;
  qty: number;
  wastePct?: number;
}

export interface PackagingUsageDto {
  packagingId: string;
  qty: number;
}

export interface LaborCostPresetDto {
  name: string;
  minutesPerBatch: number;
  batchYield: number;
  laborRatePerHour: number;
}

export interface ProductRecipeDto {
  recipeItems: RecipeItemDto[];
  packagingUsages: PackagingUsageDto[];
  laborCostPreset?: LaborCostPresetDto;
}

export interface SaleItemDto {
  productId?: string;
  variantId?: string;
  qty: number;
  unitPrice: number;
}

export interface CreateSaleOrderDto {
  date: string;
  channel: SaleChannel;
  items: SaleItemDto[];
  discounts?: number;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface PricingPreview {
  productId: string;
  productName: string;
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  totalUnitCost: number;
  suggestedPriceDirect: number;
  suggestedPriceIFood: number;
  marginDirect: {
    percent: number;
    value: number;
  };
  marginIFood: {
    percent: number;
    value: number;
  };
}

export interface ReportSummary {
  period: {
    from: string;
    to: string;
  };
  channel?: SaleChannel;
  grossRevenue: number;
  discounts: number;
  platformFees: number;
  costs: number;
  netRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface ProductReport {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  costs: number;
  profit: number;
  marginPercent: number;
}

export interface InventoryMovementDto {
  type: MovementType;
  entity: MovementEntity;
  entityId: string;
  qty: number;
  unit: string;
  unitCost?: number;
  note?: string;
  date?: string;
}

export interface ConfigDto {
  key: string;
  value: string;
  description?: string;
}

export interface CsvImportResult {
  success: boolean;
  message: string;
  processedRows: number;
  errors: string[];
  orderId?: string;
}

// Tipos para movimentação de estoque
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface CreateStockMovementDto {
  ingredientId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  notes?: string;
  date?: string;
}

export interface StockMovementDto extends CreateStockMovementDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  ingredient?: {
    id: string;
    name: string;
    unit: string;
  };
}

// Tipos para análise de estoque
export interface InventoryStatusDto {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  ingredients: IngredientStockDto[];
}

export interface IngredientStockDto {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  totalValue: number;
  stockStatus: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StockAlertDto {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK';
  message: string;
}

// Tipos para análise de custos
export interface ProductCostAnalysisDto {
  productId: string;
  productName: string;
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  totalCost: number;
  sellingPriceDirect?: number;
  sellingPriceIFood?: number;
  profitDirect: number;
  profitIFood: number;
  marginDirect: number;
  marginIFood: number;
}
