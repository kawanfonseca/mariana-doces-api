"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockTurnoverReport = exports.exportInventoryCSV = exports.getStockForecastReport = exports.getMostUsedIngredientsReport = exports.getInventoryValueReport = exports.getStockMovementsReport = void 0;
const database_1 = require("../services/database");
const getStockMovementsReport = async (req, res, next) => {
    try {
        const { dateFrom, dateTo, ingredientId, type } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom)
                where.date.gte = new Date(dateFrom);
            if (dateTo)
                where.date.lte = new Date(dateTo);
        }
        if (ingredientId) {
            where.ingredientId = ingredientId;
        }
        if (type) {
            where.type = type;
        }
        const movements = await database_1.prisma.stockMovement.findMany({
            where,
            include: {
                ingredient: {
                    select: {
                        id: true,
                        name: true,
                        unit: true,
                        costPerUnit: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        const totals = movements.reduce((acc, movement) => {
            const value = movement.quantity * movement.ingredient.costPerUnit;
            if (movement.type === 'IN') {
                acc.totalIn += movement.quantity;
                acc.totalInValue += value;
            }
            else if (movement.type === 'OUT') {
                acc.totalOut += movement.quantity;
                acc.totalOutValue += value;
            }
            else if (movement.type === 'ADJUSTMENT') {
                acc.totalAdjustments += 1;
            }
            return acc;
        }, {
            totalIn: 0,
            totalOut: 0,
            totalInValue: 0,
            totalOutValue: 0,
            totalAdjustments: 0
        });
        res.json({
            movements,
            totals,
            summary: {
                netMovement: totals.totalIn - totals.totalOut,
                netValue: totals.totalInValue - totals.totalOutValue,
                totalMovements: movements.length
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockMovementsReport = getStockMovementsReport;
const getInventoryValueReport = async (req, res, next) => {
    try {
        const { category, minValue, maxValue } = req.query;
        const where = { active: true };
        if (minValue || maxValue) {
            where.currentStock = {};
            if (minValue)
                where.currentStock.gte = parseFloat(minValue);
            if (maxValue)
                where.currentStock.lte = parseFloat(maxValue);
        }
        const ingredients = await database_1.prisma.ingredient.findMany({
            where,
            orderBy: { name: 'asc' }
        });
        const ingredientsWithValue = ingredients.map(ingredient => {
            const totalValue = ingredient.currentStock * ingredient.costPerUnit;
            const stockStatus = ingredient.currentStock <= 0
                ? 'OUT_OF_STOCK'
                : ingredient.currentStock <= ingredient.minStock
                    ? 'LOW_STOCK'
                    : 'OK';
            return {
                ...ingredient,
                totalValue: Math.round(totalValue * 100) / 100,
                stockStatus
            };
        });
        const totalValue = ingredientsWithValue.reduce((sum, ingredient) => sum + ingredient.totalValue, 0);
        const lowStockValue = ingredientsWithValue
            .filter(i => i.stockStatus === 'LOW_STOCK')
            .reduce((sum, ingredient) => sum + ingredient.totalValue, 0);
        const outOfStockValue = ingredientsWithValue
            .filter(i => i.stockStatus === 'OUT_OF_STOCK')
            .reduce((sum, ingredient) => sum + ingredient.totalValue, 0);
        res.json({
            ingredients: ingredientsWithValue,
            summary: {
                totalIngredients: ingredients.length,
                totalValue: Math.round(totalValue * 100) / 100,
                lowStockValue: Math.round(lowStockValue * 100) / 100,
                outOfStockValue: Math.round(outOfStockValue * 100) / 100,
                averageValue: ingredients.length > 0 ? Math.round((totalValue / ingredients.length) * 100) / 100 : 0
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryValueReport = getInventoryValueReport;
const getMostUsedIngredientsReport = async (req, res, next) => {
    try {
        const { dateFrom, dateTo, limit = 10 } = req.query;
        const where = { type: 'OUT' };
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom)
                where.date.gte = new Date(dateFrom);
            if (dateTo)
                where.date.lte = new Date(dateTo);
        }
        const movements = await database_1.prisma.stockMovement.findMany({
            where,
            include: {
                ingredient: {
                    select: {
                        id: true,
                        name: true,
                        unit: true,
                        costPerUnit: true
                    }
                }
            }
        });
        const ingredientUsage = new Map();
        movements.forEach(movement => {
            const ingredientId = movement.ingredientId;
            const ingredient = movement.ingredient;
            if (!ingredientUsage.has(ingredientId)) {
                ingredientUsage.set(ingredientId, {
                    ingredient,
                    totalQuantity: 0,
                    totalValue: 0,
                    movementCount: 0
                });
            }
            const usage = ingredientUsage.get(ingredientId);
            usage.totalQuantity += movement.quantity;
            usage.totalValue += movement.quantity * ingredient.costPerUnit;
            usage.movementCount += 1;
        });
        const mostUsed = Array.from(ingredientUsage.values())
            .map(usage => ({
            ...usage,
            totalValue: Math.round(usage.totalValue * 100) / 100,
            averagePerMovement: Math.round((usage.totalQuantity / usage.movementCount) * 100) / 100
        }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, parseInt(limit));
        res.json({
            mostUsed,
            summary: {
                totalIngredients: mostUsed.length,
                totalQuantity: mostUsed.reduce((sum, item) => sum + item.totalQuantity, 0),
                totalValue: mostUsed.reduce((sum, item) => sum + item.totalValue, 0)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMostUsedIngredientsReport = getMostUsedIngredientsReport;
const getStockForecastReport = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSales = await database_1.prisma.saleItem.findMany({
            where: {
                order: {
                    date: { gte: thirtyDaysAgo }
                }
            },
            include: {
                product: {
                    include: {
                        recipeItems: {
                            include: {
                                ingredient: true
                            }
                        }
                    }
                }
            }
        });
        const ingredientUsage = new Map();
        recentSales.forEach(saleItem => {
            if (!saleItem.product?.recipeItems)
                return;
            saleItem.product.recipeItems.forEach(recipeItem => {
                const ingredientId = recipeItem.ingredientId;
                const quantityUsed = recipeItem.qty * saleItem.qty;
                const wasteFactor = 1 + (recipeItem.wastePct || 0) / 100;
                const totalQuantity = quantityUsed * wasteFactor;
                if (!ingredientUsage.has(ingredientId)) {
                    ingredientUsage.set(ingredientId, {
                        ingredient: recipeItem.ingredient,
                        totalUsed: 0,
                        daysWithUsage: 0
                    });
                }
                const usage = ingredientUsage.get(ingredientId);
                usage.totalUsed += totalQuantity;
                usage.daysWithUsage += 1;
            });
        });
        const forecast = Array.from(ingredientUsage.values()).map(usage => {
            const dailyAverage = usage.totalUsed / 30;
            const forecastedUsage = dailyAverage * parseInt(days);
            const currentStock = usage.ingredient.currentStock;
            const daysRemaining = currentStock / dailyAverage;
            const needsRestock = daysRemaining <= parseInt(days);
            return {
                ingredient: usage.ingredient,
                currentStock,
                dailyAverage: Math.round(dailyAverage * 100) / 100,
                forecastedUsage: Math.round(forecastedUsage * 100) / 100,
                daysRemaining: Math.round(daysRemaining * 10) / 10,
                needsRestock,
                recommendedOrder: needsRestock ? Math.max(0, forecastedUsage - currentStock) : 0
            };
        });
        res.json({
            forecast,
            summary: {
                totalIngredients: forecast.length,
                ingredientsNeedingRestock: forecast.filter(f => f.needsRestock).length,
                averageDaysRemaining: forecast.length > 0
                    ? Math.round((forecast.reduce((sum, f) => sum + f.daysRemaining, 0) / forecast.length) * 10) / 10
                    : 0
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockForecastReport = getStockForecastReport;
const exportInventoryCSV = async (req, res, next) => {
    try {
        const { dateFrom, dateTo, type } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom)
                where.date.gte = new Date(dateFrom);
            if (dateTo)
                where.date.lte = new Date(dateTo);
        }
        if (type) {
            where.type = type;
        }
        const movements = await database_1.prisma.stockMovement.findMany({
            where,
            include: {
                ingredient: {
                    select: {
                        name: true,
                        unit: true,
                        costPerUnit: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        let csv = 'Data,Ingrediente,Unidade,Tipo,Quantidade,Valor Unitário,Valor Total,Motivo,Observações\n';
        movements.forEach(movement => {
            const value = movement.quantity * movement.ingredient.costPerUnit;
            const typeText = movement.type === 'IN' ? 'Entrada' :
                movement.type === 'OUT' ? 'Saída' : 'Ajuste';
            const row = [
                movement.date.toLocaleDateString('pt-BR'),
                movement.ingredient.name,
                movement.ingredient.unit,
                typeText,
                movement.quantity.toString(),
                movement.ingredient.costPerUnit.toFixed(2),
                value.toFixed(2),
                movement.reason,
                movement.notes || ''
            ].join(',');
            csv += row + '\n';
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-estoque.csv');
        res.send(csv);
    }
    catch (error) {
        next(error);
    }
};
exports.exportInventoryCSV = exportInventoryCSV;
const getStockTurnoverReport = async (req, res, next) => {
    try {
        const { period = 30 } = req.query;
        const periodDays = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        const movements = await database_1.prisma.stockMovement.findMany({
            where: {
                date: { gte: startDate }
            },
            include: {
                ingredient: true
            }
        });
        const turnoverMap = new Map();
        movements.forEach(movement => {
            const ingredientId = movement.ingredientId;
            if (!turnoverMap.has(ingredientId)) {
                turnoverMap.set(ingredientId, {
                    ingredient: movement.ingredient,
                    totalIn: 0,
                    totalOut: 0,
                    averageStock: movement.ingredient.currentStock
                });
            }
            const turnover = turnoverMap.get(ingredientId);
            if (movement.type === 'IN') {
                turnover.totalIn += movement.quantity;
            }
            else if (movement.type === 'OUT') {
                turnover.totalOut += movement.quantity;
            }
        });
        const turnoverReport = Array.from(turnoverMap.values()).map(item => {
            const turnoverRate = item.averageStock > 0 ? (item.totalOut / item.averageStock) * (365 / periodDays) : 0;
            const daysInStock = turnoverRate > 0 ? 365 / turnoverRate : 999;
            return {
                ingredient: item.ingredient,
                totalIn: item.totalIn,
                totalOut: item.totalOut,
                averageStock: item.averageStock,
                turnoverRate: Math.round(turnoverRate * 100) / 100,
                daysInStock: Math.round(daysInStock * 10) / 10,
                category: turnoverRate > 12 ? 'Alta Rotatividade' :
                    turnoverRate > 6 ? 'Média Rotatividade' :
                        turnoverRate > 0 ? 'Baixa Rotatividade' : 'Sem Movimentação'
            };
        }).sort((a, b) => b.turnoverRate - a.turnoverRate);
        res.json({
            turnoverReport,
            summary: {
                totalIngredients: turnoverReport.length,
                highTurnover: turnoverReport.filter(t => t.category === 'Alta Rotatividade').length,
                mediumTurnover: turnoverReport.filter(t => t.category === 'Média Rotatividade').length,
                lowTurnover: turnoverReport.filter(t => t.category === 'Baixa Rotatividade').length,
                noMovement: turnoverReport.filter(t => t.category === 'Sem Movimentação').length
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockTurnoverReport = getStockTurnoverReport;
//# sourceMappingURL=inventory-reports.controller.js.map