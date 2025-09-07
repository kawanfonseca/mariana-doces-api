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
  const percent = cost > 0 ? (value / cost) * 100 : 0;
  return { percent: Math.round(percent * 100) / 100, value: Math.round(value * 100) / 100 };
};

export const suggestPrice = (cost: number, targetMarginPercent: number): number => {
  const multiplier = 1 + (targetMarginPercent / 100);
  return Math.round(cost * multiplier * 100) / 100;
};

export const calculateIFoodPrice = (directPrice: number, iFoodFeePercent: number): number => {
  // Para manter a mesma margem líquida, precisa compensar a taxa do iFood
  const multiplier = 1 / (1 - iFoodFeePercent / 100);
  return Math.round(directPrice * multiplier * 100) / 100;
};
