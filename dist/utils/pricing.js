"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateIFoodPrice = exports.suggestPrice = exports.calculateMargin = exports.calculateLaborCost = void 0;
const calculateLaborCost = (minutesPerBatch, batchYield, laborRatePerHour) => {
    const hoursPerBatch = minutesPerBatch / 60;
    const laborCostPerBatch = hoursPerBatch * laborRatePerHour;
    return laborCostPerBatch / batchYield;
};
exports.calculateLaborCost = calculateLaborCost;
const calculateMargin = (price, cost) => {
    const value = price - cost;
    const percent = cost > 0 ? (value / cost) * 100 : 0;
    return { percent: Math.round(percent * 100) / 100, value: Math.round(value * 100) / 100 };
};
exports.calculateMargin = calculateMargin;
const suggestPrice = (cost, targetMarginPercent) => {
    const multiplier = 1 + (targetMarginPercent / 100);
    return Math.round(cost * multiplier * 100) / 100;
};
exports.suggestPrice = suggestPrice;
const calculateIFoodPrice = (directPrice, iFoodFeePercent) => {
    const multiplier = 1 / (1 - iFoodFeePercent / 100);
    return Math.round(directPrice * multiplier * 100) / 100;
};
exports.calculateIFoodPrice = calculateIFoodPrice;
//# sourceMappingURL=pricing.js.map