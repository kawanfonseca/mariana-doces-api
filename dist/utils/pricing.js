"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProductCost = exports.calculateIFoodPrice = exports.suggestPrice = exports.calculateMargin = exports.calculateLaborCost = void 0;
const calculateLaborCost = (minutesPerBatch, batchYield, laborRatePerHour) => {
    const hoursPerBatch = minutesPerBatch / 60;
    const laborCostPerBatch = hoursPerBatch * laborRatePerHour;
    return laborCostPerBatch / batchYield;
};
exports.calculateLaborCost = calculateLaborCost;
const calculateMargin = (price, cost) => {
    const value = price - cost;
    const percent = price > 0 ? (value / price) * 100 : 0;
    return { percent: Math.round(percent * 100) / 100, value: Math.round(value * 100) / 100 };
};
exports.calculateMargin = calculateMargin;
const suggestPrice = (cost, targetMarginPercent) => {
    const multiplier = 1 + (targetMarginPercent / 100);
    return Math.round(cost * multiplier * 100) / 100;
};
exports.suggestPrice = suggestPrice;
const calculateIFoodPrice = (directPrice, iFoodFeePercent) => {
    if (iFoodFeePercent >= 100)
        return directPrice;
    const multiplier = 1 / (1 - iFoodFeePercent / 100);
    return Math.round(directPrice * multiplier * 100) / 100;
};
exports.calculateIFoodPrice = calculateIFoodPrice;
const calculateProductCost = (product) => {
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
        laborCost = (0, exports.calculateLaborCost)(product.laborCostPreset.minutesPerBatch, product.laborCostPreset.batchYield, product.laborCostPreset.laborRatePerHour);
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
exports.calculateProductCost = calculateProductCost;
//# sourceMappingURL=pricing.js.map