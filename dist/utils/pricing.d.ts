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
    marginDirect: {
        percent: number;
        value: number;
    };
    marginIFood: {
        percent: number;
        value: number;
    };
}
export declare const calculateLaborCost: (minutesPerBatch: number, batchYield: number, laborRatePerHour: number) => number;
export declare const calculateMargin: (price: number, cost: number) => {
    percent: number;
    value: number;
};
export declare const suggestPrice: (cost: number, targetMarginPercent: number) => number;
export declare const calculateIFoodPrice: (directPrice: number, iFoodFeePercent: number) => number;
//# sourceMappingURL=pricing.d.ts.map