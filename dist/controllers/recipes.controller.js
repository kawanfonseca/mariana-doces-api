"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateRecipe = exports.calculateRecipeCost = exports.updateProductRecipe = exports.getProductRecipe = void 0;
const database_1 = require("../services/database");
const getProductRecipe = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await database_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        const recipe = await database_1.prisma.product.findUnique({
            where: { id: productId },
            include: {
                recipeItems: {
                    include: {
                        ingredient: {
                            select: {
                                id: true,
                                name: true,
                                unit: true,
                                costPerUnit: true,
                                currentStock: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                packagingUsages: {
                    include: {
                        packaging: {
                            select: {
                                id: true,
                                name: true,
                                unitCost: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                laborCostPreset: true
            }
        });
        res.json({
            productId: recipe?.id,
            productName: recipe?.name,
            recipeItems: recipe?.recipeItems || [],
            packagingUsages: recipe?.packagingUsages || [],
            laborCostPreset: recipe?.laborCostPreset
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductRecipe = getProductRecipe;
const updateProductRecipe = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { recipeItems, packagingUsages, laborCostPreset } = req.body;
        const product = await database_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        await database_1.prisma.$transaction(async (tx) => {
            await tx.recipeItem.deleteMany({
                where: { productId }
            });
            await tx.packagingUsage.deleteMany({
                where: { productId }
            });
            await tx.laborCostPreset.deleteMany({
                where: { productId }
            });
            if (recipeItems && recipeItems.length > 0) {
                for (const item of recipeItems) {
                    const ingredient = await tx.ingredient.findUnique({
                        where: { id: item.ingredientId }
                    });
                    if (!ingredient) {
                        throw new Error(`Ingrediente não encontrado: ${item.ingredientId}`);
                    }
                }
                await tx.recipeItem.createMany({
                    data: recipeItems.map(item => ({
                        productId,
                        ingredientId: item.ingredientId,
                        qty: item.qty,
                        wastePct: item.wastePct || 0
                    }))
                });
            }
            if (packagingUsages && packagingUsages.length > 0) {
                for (const usage of packagingUsages) {
                    const packaging = await tx.packaging.findUnique({
                        where: { id: usage.packagingId }
                    });
                    if (!packaging) {
                        throw new Error(`Embalagem não encontrada: ${usage.packagingId}`);
                    }
                }
                await tx.packagingUsage.createMany({
                    data: packagingUsages.map(usage => ({
                        productId,
                        packagingId: usage.packagingId,
                        qty: usage.qty
                    }))
                });
            }
            if (laborCostPreset) {
                await tx.laborCostPreset.create({
                    data: {
                        productId: productId,
                        name: laborCostPreset.name,
                        minutesPerBatch: laborCostPreset.minutesPerBatch,
                        batchYield: laborCostPreset.batchYield,
                        laborRatePerHour: laborCostPreset.laborRatePerHour
                    }
                });
            }
        });
        const updatedRecipe = await database_1.prisma.product.findUnique({
            where: { id: productId },
            include: {
                recipeItems: {
                    include: {
                        ingredient: {
                            select: {
                                id: true,
                                name: true,
                                unit: true,
                                costPerUnit: true,
                                currentStock: true
                            }
                        }
                    }
                },
                packagingUsages: {
                    include: {
                        packaging: {
                            select: {
                                id: true,
                                name: true,
                                unitCost: true
                            }
                        }
                    }
                },
                laborCostPreset: true
            }
        });
        res.json({
            message: 'Receita atualizada com sucesso',
            recipe: {
                productId: updatedRecipe?.id,
                productName: updatedRecipe?.name,
                recipeItems: updatedRecipe?.recipeItems || [],
                packagingUsages: updatedRecipe?.packagingUsages || [],
                laborCostPreset: updatedRecipe?.laborCostPreset
            }
        });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('não encontrado')) {
            res.status(404).json({ error: error.message });
            return;
        }
        next(error);
    }
};
exports.updateProductRecipe = updateProductRecipe;
const calculateRecipeCost = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await database_1.prisma.product.findUnique({
            where: { id: productId },
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
        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        let ingredientsCost = 0;
        let packagingCost = 0;
        let laborCost = 0;
        const ingredientBreakdown = product.recipeItems.map(item => {
            const wasteFactor = 1 + (item.wastePct || 0) / 100;
            const cost = item.qty * item.ingredient.costPerUnit * wasteFactor;
            ingredientsCost += cost;
            return {
                ingredientId: item.ingredient.id,
                ingredientName: item.ingredient.name,
                quantity: item.qty,
                unit: item.ingredient.unit,
                costPerUnit: item.ingredient.costPerUnit,
                wastePct: item.wastePct || 0,
                totalCost: Math.round(cost * 100) / 100
            };
        });
        const packagingBreakdown = product.packagingUsages.map(usage => {
            const cost = usage.qty * usage.packaging.unitCost;
            packagingCost += cost;
            return {
                packagingId: usage.packaging.id,
                packagingName: usage.packaging.name,
                quantity: usage.qty,
                unitCost: usage.packaging.unitCost,
                totalCost: Math.round(cost * 100) / 100
            };
        });
        let laborBreakdown = null;
        if (product.laborCostPreset) {
            const laborCostPerUnit = (product.laborCostPreset.minutesPerBatch *
                product.laborCostPreset.laborRatePerHour / 60) /
                product.laborCostPreset.batchYield;
            laborCost = laborCostPerUnit;
            laborBreakdown = {
                name: product.laborCostPreset.name,
                minutesPerBatch: product.laborCostPreset.minutesPerBatch,
                batchYield: product.laborCostPreset.batchYield,
                laborRatePerHour: product.laborCostPreset.laborRatePerHour,
                costPerUnit: Math.round(laborCostPerUnit * 100) / 100
            };
        }
        const totalCost = ingredientsCost + packagingCost + laborCost;
        res.json({
            productId: product.id,
            productName: product.name,
            ingredientsCost: Math.round(ingredientsCost * 100) / 100,
            packagingCost: Math.round(packagingCost * 100) / 100,
            laborCost: Math.round(laborCost * 100) / 100,
            totalCost: Math.round(totalCost * 100) / 100,
            breakdown: {
                ingredients: ingredientBreakdown,
                packaging: packagingBreakdown,
                labor: laborBreakdown
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.calculateRecipeCost = calculateRecipeCost;
const duplicateRecipe = async (req, res, next) => {
    try {
        const { sourceProductId } = req.params;
        const { targetProductId } = req.body;
        const [sourceProduct, targetProduct] = await Promise.all([
            database_1.prisma.product.findUnique({ where: { id: sourceProductId } }),
            database_1.prisma.product.findUnique({ where: { id: targetProductId } })
        ]);
        if (!sourceProduct) {
            res.status(404).json({ error: 'Produto origem não encontrado' });
            return;
        }
        if (!targetProduct) {
            res.status(404).json({ error: 'Produto destino não encontrado' });
            return;
        }
        const sourceRecipe = await database_1.prisma.product.findUnique({
            where: { id: sourceProductId },
            include: {
                recipeItems: true,
                packagingUsages: true,
                laborCostPreset: true
            }
        });
        if (!sourceRecipe || (!sourceRecipe.recipeItems.length &&
            !sourceRecipe.packagingUsages.length &&
            !sourceRecipe.laborCostPreset)) {
            res.status(404).json({ error: 'Receita origem não encontrada ou está vazia' });
            return;
        }
        await database_1.prisma.$transaction(async (tx) => {
            await tx.recipeItem.deleteMany({
                where: { productId: targetProductId }
            });
            await tx.packagingUsage.deleteMany({
                where: { productId: targetProductId }
            });
            await tx.laborCostPreset.deleteMany({
                where: { productId: targetProductId }
            });
            if (sourceRecipe.recipeItems.length > 0) {
                await tx.recipeItem.createMany({
                    data: sourceRecipe.recipeItems.map(item => ({
                        productId: targetProductId,
                        ingredientId: item.ingredientId,
                        qty: item.qty,
                        wastePct: item.wastePct
                    }))
                });
            }
            if (sourceRecipe.packagingUsages.length > 0) {
                await tx.packagingUsage.createMany({
                    data: sourceRecipe.packagingUsages.map(usage => ({
                        productId: targetProductId,
                        packagingId: usage.packagingId,
                        qty: usage.qty
                    }))
                });
            }
            if (sourceRecipe.laborCostPreset) {
                await tx.laborCostPreset.create({
                    data: {
                        productId: targetProductId,
                        name: sourceRecipe.laborCostPreset.name,
                        minutesPerBatch: sourceRecipe.laborCostPreset.minutesPerBatch,
                        batchYield: sourceRecipe.laborCostPreset.batchYield,
                        laborRatePerHour: sourceRecipe.laborCostPreset.laborRatePerHour
                    }
                });
            }
        });
        res.json({
            message: `Receita copiada com sucesso de "${sourceProduct.name}" para "${targetProduct.name}"`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.duplicateRecipe = duplicateRecipe;
//# sourceMappingURL=recipes.controller.js.map