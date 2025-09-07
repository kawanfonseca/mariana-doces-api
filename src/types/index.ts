import { Request } from 'express';
// Tipos temporários até o Prisma Client ser gerado corretamente
export type UserRole = 'ADMIN' | 'OPERATOR';
export type SaleChannel = 'DIRECT' | 'IFOOD';
export type MovementType = 'IN' | 'OUT' | 'ADJUST';
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
