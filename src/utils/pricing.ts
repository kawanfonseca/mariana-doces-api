export interface CostCalculation {
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  overheadCost: number;
  totalUnitCost: number;
}

export interface PriceCalculation extends CostCalculation {
  suggestedPriceDirect: number;
  suggestedPriceIFood: number;
  marginDirect: { percent: number; value: number };
  marginIFood: { percent: number; value: number };
}

export const calculateLaborCost = (
  minutesPerBatch: number,
  batchYield: number,
  laborRatePerHour: number
): number => {
  const hoursPerBatch = minutesPerBatch / 60;
  const laborCostPerBatch = hoursPerBatch * laborRatePerHour;
  return laborCostPerBatch / batchYield;
};

export const calculateMargin = (price: number, cost: number) => {
  const value = price - cost;
  const percent = price > 0 ? (value / price) * 100 : 0;
  return { percent: Math.round(percent * 100) / 100, value: Math.round(value * 100) / 100 };
};

export const suggestPrice = (cost: number, targetMarginPercent: number): number => {
  const multiplier = 1 + (targetMarginPercent / 100);
  return Math.round(cost * multiplier * 100) / 100;
};

export const calculateIFoodPrice = (directPrice: number, iFoodFeePercent: number): number => {
  if (iFoodFeePercent >= 100) return directPrice;
  const multiplier = 1 / (1 - iFoodFeePercent / 100);
  return Math.round(directPrice * multiplier * 100) / 100;
};

export interface ProductWithCostData {
  recipeItems: Array<{
    qty: number;
    wastePct: number | null;
    ingredient: { costPerUnit: number };
  }>;
  packagingUsages: Array<{
    qty: number;
    packaging: { unitCost: number };
  }>;
  laborCostPreset: {
    minutesPerBatch: number;
    batchYield: number;
    laborRatePerHour: number;
  } | null;
}

export const calculateProductCost = (product: ProductWithCostData): CostCalculation => {
  let ingredientsCost = 0;
  let packagingCost = 0;
  let laborCost = 0;

  product.recipeItems.forEach(item => {
    const wasteFactor = 1 + (item.wastePct || 0) / 100;
    ingredientsCost += item.qty * item.ingredient.costPerUnit * wasteFactor;
  });

  product.packagingUsages.forEach(usage => {
    packagingCost += usage.qty * usage.packaging.unitCost;
  });

  if (product.laborCostPreset) {
    laborCost = calculateLaborCost(
      product.laborCostPreset.minutesPerBatch,
      product.laborCostPreset.batchYield,
      product.laborCostPreset.laborRatePerHour
    );
  }

  const totalUnitCost = ingredientsCost + packagingCost + laborCost;

  return {
    ingredientsCost: Math.round(ingredientsCost * 100) / 100,
    packagingCost: Math.round(packagingCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    overheadCost: 0,
    totalUnitCost: Math.round(totalUnitCost * 100) / 100,
  };
};
