"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCostAnalysis = exports.getStockAlerts = exports.getInventoryStatus = exports.createStockMovement = exports.getStockMovement = exports.getStockMovements = void 0;
const database_1 = require("../services/database");
const getStockMovements = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, ingredientId } = req.query;
        const skip = (page - 1) * limit;
        const where = {
            ...(ingredientId && { ingredientId })
        };
        const [stockMovements, total] = await Promise.all([
            database_1.prisma.stockMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    ingredient: {
                        select: {
                            id: true,
                            name: true,
                            unit: true
                        }
                    }
                }
            }),
            database_1.prisma.stockMovement.count({ where })
        ]);
        res.json({
            data: stockMovements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockMovements = getStockMovements;
const getStockMovement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const stockMovement = await database_1.prisma.stockMovement.findUnique({
            where: { id },
            include: {
                ingredient: {
                    select: {
                        id: true,
                        name: true,
                        unit: true
                    }
                }
            }
        });
        if (!stockMovement) {
            res.status(404).json({ error: 'Movimentação não encontrada' });
            return;
        }
        res.json(stockMovement);
    }
    catch (error) {
        next(error);
    }
};
exports.getStockMovement = getStockMovement;
const createStockMovement = async (req, res, next) => {
    try {
        const data = req.body;
        const ingredient = await database_1.prisma.ingredient.findUnique({
            where: { id: data.ingredientId }
        });
        if (!ingredient) {
            res.status(404).json({ error: 'Ingrediente não encontrado' });
            return;
        }
        if (data.type === 'OUT' && ingredient.currentStock < data.quantity) {
            res.status(400).json({
                error: 'Estoque insuficiente',
                details: `Estoque atual: ${ingredient.currentStock} ${ingredient.unit}`
            });
            return;
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            const stockMovement = await tx.stockMovement.create({
                data: {
                    ingredientId: data.ingredientId,
                    type: data.type,
                    quantity: data.quantity,
                    reason: data.reason,
                    notes: data.notes,
                    date: data.date ? new Date(data.date) : new Date()
                },
                include: {
                    ingredient: {
                        select: {
                            id: true,
                            name: true,
                            unit: true
                        }
                    }
                }
            });
            let stockChange = 0;
            switch (data.type) {
                case 'IN':
                    stockChange = data.quantity;
                    break;
                case 'OUT':
                    stockChange = -data.quantity;
                    break;
                case 'ADJUSTMENT':
                    stockChange = data.quantity - ingredient.currentStock;
                    break;
            }
            await tx.ingredient.update({
                where: { id: data.ingredientId },
                data: {
                    currentStock: Math.max(0, ingredient.currentStock + stockChange)
                }
            });
            return stockMovement;
        });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.createStockMovement = createStockMovement;
const getInventoryStatus = async (req, res, next) => {
    try {
        const ingredients = await database_1.prisma.ingredient.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        const status = {
            total: ingredients.length,
            lowStock: 0,
            outOfStock: 0,
            totalValue: 0,
            ingredients: []
        };
        for (const ingredient of ingredients) {
            let stockStatus = 'OK';
            if (ingredient.currentStock <= 0) {
                stockStatus = 'OUT_OF_STOCK';
                status.outOfStock++;
            }
            else if (ingredient.currentStock <= ingredient.minStock) {
                stockStatus = 'LOW_STOCK';
                status.lowStock++;
            }
            const totalValue = ingredient.currentStock * ingredient.costPerUnit;
            status.totalValue += totalValue;
            status.ingredients.push({
                id: ingredient.id,
                name: ingredient.name,
                unit: ingredient.unit,
                currentStock: ingredient.currentStock,
                minStock: ingredient.minStock,
                costPerUnit: ingredient.costPerUnit,
                totalValue,
                stockStatus
            });
        }
        res.json(status);
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryStatus = getInventoryStatus;
const getStockAlerts = async (req, res, next) => {
    try {
        const ingredients = await database_1.prisma.ingredient.findMany({
            where: {
                active: true,
                OR: [
                    { currentStock: { lte: 0 } },
                    {
                        AND: [
                            { currentStock: { gt: 0 } },
                            { currentStock: { lte: database_1.prisma.ingredient.fields.minStock } }
                        ]
                    }
                ]
            },
            orderBy: { currentStock: 'asc' }
        });
        const alerts = ingredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            unit: ingredient.unit,
            currentStock: ingredient.currentStock,
            minStock: ingredient.minStock,
            alertType: ingredient.currentStock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            message: ingredient.currentStock <= 0
                ? 'Sem estoque'
                : `Estoque baixo (${ingredient.currentStock} ${ingredient.unit})`
        }));
        res.json(alerts);
    }
    catch (error) {
        next(error);
    }
};
exports.getStockAlerts = getStockAlerts;
const getCostAnalysis = async (req, res, next) => {
    try {
        const products = await database_1.prisma.product.findMany({
            where: { active: true },
            include: {
                recipeItems: {
                    include: {
                        ingredient: true
                    }
                },
                packagingUsages: {
                    include: {
                        packaging: true
                    }
                },
                laborCostPreset: true
            }
        });
        const analysis = products.map(product => {
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
                const laborCostPerUnit = (product.laborCostPreset.minutesPerBatch *
                    product.laborCostPreset.laborRatePerHour / 60) /
                    product.laborCostPreset.batchYield;
                laborCost = laborCostPerUnit;
            }
            const totalCost = ingredientsCost + packagingCost + laborCost;
            const profitDirect = product.channelBasePriceDirect ?
                product.channelBasePriceDirect - totalCost : 0;
            const profitIFood = product.channelBasePriceIFood ?
                product.channelBasePriceIFood - totalCost : 0;
            return {
                productId: product.id,
                productName: product.name,
                ingredientsCost: Math.round(ingredientsCost * 100) / 100,
                packagingCost: Math.round(packagingCost * 100) / 100,
                laborCost: Math.round(laborCost * 100) / 100,
                totalCost: Math.round(totalCost * 100) / 100,
                sellingPriceDirect: product.channelBasePriceDirect || undefined,
                sellingPriceIFood: product.channelBasePriceIFood || undefined,
                profitDirect: Math.round(profitDirect * 100) / 100,
                profitIFood: Math.round(profitIFood * 100) / 100,
                marginDirect: product.channelBasePriceDirect ?
                    Math.round((profitDirect / product.channelBasePriceDirect) * 10000) / 100 : 0,
                marginIFood: product.channelBasePriceIFood ?
                    Math.round((profitIFood / product.channelBasePriceIFood) * 10000) / 100 : 0
            };
        });
        res.json(analysis);
    }
    catch (error) {
        next(error);
    }
};
exports.getCostAnalysis = getCostAnalysis;
//# sourceMappingURL=stock.controller.js.map