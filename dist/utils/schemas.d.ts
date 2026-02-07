import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "OPERATOR"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "OPERATOR" | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "OPERATOR" | undefined;
}>;
export declare const createIngredientSchema: z.ZodObject<{
    name: z.ZodString;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    supplier: z.ZodOptional<z.ZodString>;
    currentStock: z.ZodOptional<z.ZodNumber>;
    minStock: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    unit: string;
    costPerUnit: number;
    supplier?: string | undefined;
    currentStock?: number | undefined;
    minStock?: number | undefined;
}, {
    name: string;
    unit: string;
    costPerUnit: number;
    supplier?: string | undefined;
    currentStock?: number | undefined;
    minStock?: number | undefined;
}>;
export declare const updateIngredientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    unit: z.ZodOptional<z.ZodString>;
    costPerUnit: z.ZodOptional<z.ZodNumber>;
    supplier: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    currentStock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    minStock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    active?: boolean | undefined;
    unit?: string | undefined;
    costPerUnit?: number | undefined;
    supplier?: string | undefined;
    currentStock?: number | undefined;
    minStock?: number | undefined;
}, {
    name?: string | undefined;
    active?: boolean | undefined;
    unit?: string | undefined;
    costPerUnit?: number | undefined;
    supplier?: string | undefined;
    currentStock?: number | undefined;
    minStock?: number | undefined;
}>;
export declare const createPackagingSchema: z.ZodObject<{
    name: z.ZodString;
    unitCost: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    unitCost: number;
}, {
    name: string;
    unitCost: number;
}>;
export declare const updatePackagingSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    unitCost: z.ZodOptional<z.ZodNumber>;
} & {
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    active?: boolean | undefined;
    unitCost?: number | undefined;
}, {
    name?: string | undefined;
    active?: boolean | undefined;
    unitCost?: number | undefined;
}>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    channelBasePriceDirect: z.ZodOptional<z.ZodNumber>;
    channelBasePriceIFood: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    channelBasePriceDirect?: number | undefined;
    channelBasePriceIFood?: number | undefined;
}, {
    name: string;
    channelBasePriceDirect?: number | undefined;
    channelBasePriceIFood?: number | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    channelBasePriceDirect: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    channelBasePriceIFood: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    active?: boolean | undefined;
    channelBasePriceDirect?: number | undefined;
    channelBasePriceIFood?: number | undefined;
}, {
    name?: string | undefined;
    active?: boolean | undefined;
    channelBasePriceDirect?: number | undefined;
    channelBasePriceIFood?: number | undefined;
}>;
export declare const recipeItemSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    qty: z.ZodNumber;
    wastePct: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    ingredientId: string;
    qty: number;
    wastePct?: number | undefined;
}, {
    ingredientId: string;
    qty: number;
    wastePct?: number | undefined;
}>;
export declare const packagingUsageSchema: z.ZodObject<{
    packagingId: z.ZodString;
    qty: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    qty: number;
    packagingId: string;
}, {
    qty: number;
    packagingId: string;
}>;
export declare const laborCostPresetSchema: z.ZodObject<{
    name: z.ZodString;
    minutesPerBatch: z.ZodNumber;
    batchYield: z.ZodNumber;
    laborRatePerHour: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    minutesPerBatch: number;
    batchYield: number;
    laborRatePerHour: number;
}, {
    name: string;
    minutesPerBatch: number;
    batchYield: number;
    laborRatePerHour: number;
}>;
export declare const productRecipeSchema: z.ZodObject<{
    recipeItems: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        qty: z.ZodNumber;
        wastePct: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ingredientId: string;
        qty: number;
        wastePct?: number | undefined;
    }, {
        ingredientId: string;
        qty: number;
        wastePct?: number | undefined;
    }>, "many">;
    packagingUsages: z.ZodArray<z.ZodObject<{
        packagingId: z.ZodString;
        qty: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        qty: number;
        packagingId: string;
    }, {
        qty: number;
        packagingId: string;
    }>, "many">;
    laborCostPreset: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        minutesPerBatch: z.ZodNumber;
        batchYield: z.ZodNumber;
        laborRatePerHour: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        minutesPerBatch: number;
        batchYield: number;
        laborRatePerHour: number;
    }, {
        name: string;
        minutesPerBatch: number;
        batchYield: number;
        laborRatePerHour: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    recipeItems: {
        ingredientId: string;
        qty: number;
        wastePct?: number | undefined;
    }[];
    packagingUsages: {
        qty: number;
        packagingId: string;
    }[];
    laborCostPreset?: {
        name: string;
        minutesPerBatch: number;
        batchYield: number;
        laborRatePerHour: number;
    } | undefined;
}, {
    recipeItems: {
        ingredientId: string;
        qty: number;
        wastePct?: number | undefined;
    }[];
    packagingUsages: {
        qty: number;
        packagingId: string;
    }[];
    laborCostPreset?: {
        name: string;
        minutesPerBatch: number;
        batchYield: number;
        laborRatePerHour: number;
    } | undefined;
}>;
export declare const saleItemSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    variantId: z.ZodOptional<z.ZodString>;
    qty: z.ZodNumber;
    unitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    qty: number;
    unitPrice: number;
    productId?: string | undefined;
    variantId?: string | undefined;
}, {
    qty: number;
    unitPrice: number;
    productId?: string | undefined;
    variantId?: string | undefined;
}>, {
    qty: number;
    unitPrice: number;
    productId?: string | undefined;
    variantId?: string | undefined;
}, {
    qty: number;
    unitPrice: number;
    productId?: string | undefined;
    variantId?: string | undefined;
}>;
export declare const createSaleOrderSchema: z.ZodObject<{
    date: z.ZodEffects<z.ZodString, string, string>;
    channel: z.ZodEnum<["DIRECT", "IFOOD"]>;
    items: z.ZodArray<z.ZodEffects<z.ZodObject<{
        productId: z.ZodOptional<z.ZodString>;
        variantId: z.ZodOptional<z.ZodString>;
        qty: z.ZodNumber;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        qty: number;
        unitPrice: number;
        productId?: string | undefined;
        variantId?: string | undefined;
    }, {
        qty: number;
        unitPrice: number;
        productId?: string | undefined;
        variantId?: string | undefined;
    }>, {
        qty: number;
        unitPrice: number;
        productId?: string | undefined;
        variantId?: string | undefined;
    }, {
        qty: number;
        unitPrice: number;
        productId?: string | undefined;
        variantId?: string | undefined;
    }>, "many">;
    discounts: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    customerPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    channel: "DIRECT" | "IFOOD";
    items: {
        qty: number;
        unitPrice: number;
        productId?: string | undefined;
        variantId?: string | undefined;
    }[];
    notes?: string | undefined;
    discounts?: number | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
}, {
    date: string;
    channel: "DIRECT" | "IFOOD";
    items: {
        qty: number;
        unitPrice: number;
        productId?: string | undefined;
        variantId?: string | undefined;
    }[];
    notes?: string | undefined;
    discounts?: number | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
}>;
export declare const inventoryMovementSchema: z.ZodObject<{
    type: z.ZodEnum<["IN", "OUT", "ADJUSTMENT"]>;
    entity: z.ZodEnum<["INGREDIENT", "PACKAGING", "PRODUCT"]>;
    entityId: z.ZodString;
    qty: z.ZodNumber;
    unit: z.ZodString;
    unitCost: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    unit: string;
    qty: number;
    type: "IN" | "OUT" | "ADJUSTMENT";
    entity: "INGREDIENT" | "PACKAGING" | "PRODUCT";
    entityId: string;
    date?: string | undefined;
    unitCost?: number | undefined;
    note?: string | undefined;
}, {
    unit: string;
    qty: number;
    type: "IN" | "OUT" | "ADJUSTMENT";
    entity: "INGREDIENT" | "PACKAGING" | "PRODUCT";
    entityId: string;
    date?: string | undefined;
    unitCost?: number | undefined;
    note?: string | undefined;
}>;
export declare const configSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key: string;
    value: string;
    description?: string | undefined;
}, {
    key: string;
    value: string;
    description?: string | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
}, {
    search?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const dateRangeSchema: z.ZodEffects<z.ZodObject<{
    dateFrom: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    dateTo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    channel: z.ZodOptional<z.ZodEnum<["DIRECT", "IFOOD"]>>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    dateFrom: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    dateTo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    channel: z.ZodOptional<z.ZodEnum<["DIRECT", "IFOOD"]>>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    dateFrom: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    dateTo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    channel: z.ZodOptional<z.ZodEnum<["DIRECT", "IFOOD"]>>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>, z.objectOutputType<{
    dateFrom: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    dateTo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    channel: z.ZodOptional<z.ZodEnum<["DIRECT", "IFOOD"]>>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    dateFrom: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    dateTo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    channel: z.ZodOptional<z.ZodEnum<["DIRECT", "IFOOD"]>>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const createStockMovementSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    type: z.ZodEnum<["IN", "OUT", "ADJUSTMENT"]>;
    quantity: z.ZodNumber;
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    ingredientId: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    reason: string;
    notes?: string | undefined;
    date?: string | undefined;
}, {
    ingredientId: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    reason: string;
    notes?: string | undefined;
    date?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map