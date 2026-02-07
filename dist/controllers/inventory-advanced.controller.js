"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiringIngredients = exports.getIngredientHistory = exports.autoRestock = exports.consumeIngredientsForProduction = exports.transferStock = exports.bulkStockAdjustment = void 0;
const database_1 = require("../services/database");
const bulkStockAdjustment = async (req, res, next) => {
    try {
        const { adjustments, reason, notes } = req.body;
        if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
            res.status(400).json({ error: 'Lista de ajustes é obrigatória' });
            return;
        }
        const results = await database_1.prisma.$transaction(async (tx) => {
            const createdMovements = [];
            for (const adjustment of adjustments) {
                const { ingredientId, newStock } = adjustment;
                const ingredient = await tx.ingredient.findUnique({
                    where: { id: ingredientId }
                });
                if (!ingredient) {
                    throw new Error(`Ingrediente não encontrado: ${ingredientId}`);
                }
                const movement = await tx.stockMovement.create({
                    data: {
                        ingredientId,
                        type: 'ADJUSTMENT',
                        quantity: newStock,
                        reason: reason || 'Ajuste em lote',
                        notes: notes || `Ajuste de ${ingredient.currentStock} para ${newStock}`,
                        date: new Date()
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
                await tx.ingredient.update({
                    where: { id: ingredientId },
                    data: { currentStock: newStock }
                });
                createdMovements.push(movement);
            }
            return createdMovements;
        });
        res.json({
            message: `${results.length} ajustes realizados com sucesso`,
            movements: results
        });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkStockAdjustment = bulkStockAdjustment;
const transferStock = async (req, res, next) => {
    try {
        const { fromIngredientId, toIngredientId, quantity, reason, notes } = req.body;
        if (!fromIngredientId || !toIngredientId || !quantity) {
            res.status(400).json({
                error: 'Ingrediente origem, destino e quantidade são obrigatórios'
            });
            return;
        }
        if (fromIngredientId === toIngredientId) {
            res.status(400).json({
                error: 'Ingrediente origem e destino devem ser diferentes'
            });
            return;
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            const [fromIngredient, toIngredient] = await Promise.all([
                tx.ingredient.findUnique({ where: { id: fromIngredientId } }),
                tx.ingredient.findUnique({ where: { id: toIngredientId } })
            ]);
            if (!fromIngredient) {
                throw new Error('Ingrediente origem não encontrado');
            }
            if (!toIngredient) {
                throw new Error('Ingrediente destino não encontrado');
            }
            if (fromIngredient.currentStock < quantity) {
                throw new Error(`Estoque insuficiente. Disponível: ${fromIngredient.currentStock} ${fromIngredient.unit}`);
            }
            const outMovement = await tx.stockMovement.create({
                data: {
                    ingredientId: fromIngredientId,
                    type: 'OUT',
                    quantity,
                    reason: reason || 'Transferência de estoque',
                    notes: notes || `Transferido para ${toIngredient.name}`,
                    date: new Date()
                },
                include: {
                    ingredient: {
                        select: { id: true, name: true, unit: true }
                    }
                }
            });
            const inMovement = await tx.stockMovement.create({
                data: {
                    ingredientId: toIngredientId,
                    type: 'IN',
                    quantity,
                    reason: reason || 'Transferência de estoque',
                    notes: notes || `Recebido de ${fromIngredient.name}`,
                    date: new Date()
                },
                include: {
                    ingredient: {
                        select: { id: true, name: true, unit: true }
                    }
                }
            });
            await Promise.all([
                tx.ingredient.update({
                    where: { id: fromIngredientId },
                    data: { currentStock: fromIngredient.currentStock - quantity }
                }),
                tx.ingredient.update({
                    where: { id: toIngredientId },
                    data: { currentStock: toIngredient.currentStock + quantity }
                })
            ]);
            return { outMovement, inMovement };
        });
        res.json({
            message: 'Transferência realizada com sucesso',
            transfer: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.transferStock = transferStock;
const consumeIngredientsForProduction = async (req, res, next) => {
    try {
        const { productId, quantity, reason, notes } = req.body;
        if (!productId || !quantity) {
            res.status(400).json({
                error: 'Produto e quantidade são obrigatórios'
            });
            return;
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: productId },
                include: {
                    recipeItems: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            });
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            if (!product.recipeItems || product.recipeItems.length === 0) {
                throw new Error('Produto não possui receita cadastrada');
            }
            const movements = [];
            for (const recipeItem of product.recipeItems) {
                const wasteFactor = 1 + (recipeItem.wastePct || 0) / 100;
                const totalQuantity = recipeItem.qty * quantity * wasteFactor;
                if (recipeItem.ingredient.currentStock < totalQuantity) {
                    throw new Error(`Estoque insuficiente de ${recipeItem.ingredient.name}. ` +
                        `Necessário: ${totalQuantity} ${recipeItem.ingredient.unit}, ` +
                        `Disponível: ${recipeItem.ingredient.currentStock} ${recipeItem.ingredient.unit}`);
                }
                const movement = await tx.stockMovement.create({
                    data: {
                        ingredientId: recipeItem.ingredientId,
                        type: 'OUT',
                        quantity: totalQuantity,
                        reason: reason || 'Produção',
                        notes: notes || `Produção de ${quantity}x ${product.name}`,
                        date: new Date()
                    },
                    include: {
                        ingredient: {
                            select: { id: true, name: true, unit: true }
                        }
                    }
                });
                await tx.ingredient.update({
                    where: { id: recipeItem.ingredientId },
                    data: {
                        currentStock: recipeItem.ingredient.currentStock - totalQuantity
                    }
                });
                movements.push(movement);
            }
            return { product, movements };
        });
        res.json({
            message: `Consumo registrado para ${quantity} unidades de ${result.product.name}`,
            movements: result.movements
        });
    }
    catch (error) {
        next(error);
    }
};
exports.consumeIngredientsForProduction = consumeIngredientsForProduction;
const autoRestock = async (req, res, next) => {
    try {
        const { reason, notes, multiplier = 2 } = req.body;
        const result = await database_1.prisma.$transaction(async (tx) => {
            const allActiveIngredients = await tx.ingredient.findMany({
                where: { active: true }
            });
            const ingredientsToRestock = allActiveIngredients.filter(i => i.currentStock <= 0 || (i.currentStock > 0 && i.currentStock <= i.minStock));
            const movements = [];
            for (const ingredient of ingredientsToRestock) {
                const targetStock = ingredient.minStock * multiplier;
                const quantityToAdd = Math.max(0, targetStock - ingredient.currentStock);
                if (quantityToAdd > 0) {
                    const movement = await tx.stockMovement.create({
                        data: {
                            ingredientId: ingredient.id,
                            type: 'IN',
                            quantity: quantityToAdd,
                            reason: reason || 'Reabastecimento automático',
                            notes: notes || `Estoque baixo: ${ingredient.currentStock} ${ingredient.unit}`,
                            date: new Date()
                        },
                        include: {
                            ingredient: {
                                select: { id: true, name: true, unit: true }
                            }
                        }
                    });
                    await tx.ingredient.update({
                        where: { id: ingredient.id },
                        data: { currentStock: ingredient.currentStock + quantityToAdd }
                    });
                    movements.push(movement);
                }
            }
            return movements;
        });
        res.json({
            message: `${result.length} ingredientes reabastecidos automaticamente`,
            movements: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.autoRestock = autoRestock;
const getIngredientHistory = async (req, res, next) => {
    try {
        const { ingredientId } = req.params;
        const { dateFrom, dateTo } = req.query;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 100);
        const skip = (page - 1) * limit;
        const where = { ingredientId };
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom)
                where.date.gte = new Date(dateFrom);
            if (dateTo)
                where.date.lte = new Date(dateTo);
        }
        const [movements, total] = await Promise.all([
            database_1.prisma.stockMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
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
            }),
            database_1.prisma.stockMovement.count({ where })
        ]);
        const currentStock = await database_1.prisma.ingredient.findUnique({
            where: { id: ingredientId },
            select: { currentStock: true }
        });
        res.json({
            movements,
            currentStock: currentStock?.currentStock || 0,
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
exports.getIngredientHistory = getIngredientHistory;
const getExpiringIngredients = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const recentMovements = await database_1.prisma.stockMovement.findMany({
            where: {
                type: 'IN',
                date: {
                    gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                ingredient: true
            },
            orderBy: { date: 'desc' }
        });
        const expiringMap = new Map();
        recentMovements.forEach(movement => {
            const ingredientId = movement.ingredientId;
            if (!expiringMap.has(ingredientId)) {
                const expirationDate = new Date(movement.date);
                expirationDate.setDate(expirationDate.getDate() + 60);
                expiringMap.set(ingredientId, {
                    ingredient: movement.ingredient,
                    lastEntryDate: movement.date,
                    expirationDate,
                    quantity: movement.quantity,
                    daysToExpire: Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                });
            }
        });
        const expiringIngredients = Array.from(expiringMap.values())
            .filter(item => item.daysToExpire <= parseInt(days) && item.daysToExpire > 0)
            .sort((a, b) => a.daysToExpire - b.daysToExpire);
        res.json({
            expiringIngredients,
            summary: {
                totalExpiring: expiringIngredients.length,
                expiringThisWeek: expiringIngredients.filter(i => i.daysToExpire <= 7).length,
                expiringThisMonth: expiringIngredients.filter(i => i.daysToExpire <= 30).length
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExpiringIngredients = getExpiringIngredients;
//# sourceMappingURL=inventory-advanced.controller.js.map