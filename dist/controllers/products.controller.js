"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPricingPreview = exports.updateProductRecipe = exports.getProductRecipe = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const database_1 = require("../services/database");
const pricing_1 = require("../utils/pricing");
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (page - 1) * limit;
        const where = {
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive'
                }
            })
        };
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    variants: true,
                    laborCostPreset: true
                }
            }),
            database_1.prisma.product.count({ where })
        ]);
        res.json({
            data: products,
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
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await database_1.prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
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
                laborCostPreset: true,
                saleItems: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        order: {
                            select: { date: true, channel: true }
                        }
                    }
                }
            }
        });
        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res, next) => {
    try {
        const data = req.body;
        const product = await database_1.prisma.product.create({
            data
        });
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const product = await database_1.prisma.product.update({
            where: { id },
            data
        });
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const salesCount = await database_1.prisma.saleItem.count({
            where: { productId: id }
        });
        if (salesCount > 0) {
            res.status(400).json({
                error: 'Não é possível excluir produto que possui vendas registradas'
            });
            return;
        }
        await database_1.prisma.product.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const getProductRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await database_1.prisma.product.findUnique({
            where: { id },
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
        res.json({
            recipeItems: product.recipeItems,
            packagingUsages: product.packagingUsages,
            laborCostPreset: product.laborCostPreset
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductRecipe = getProductRecipe;
const updateProductRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { recipeItems, packagingUsages, laborCostPreset } = req.body;
        await database_1.prisma.$transaction(async (tx) => {
            await tx.recipeItem.deleteMany({
                where: { productId: id }
            });
            await tx.packagingUsage.deleteMany({
                where: { productId: id }
            });
            await tx.laborCostPreset.deleteMany({
                where: { productId: id }
            });
            if (recipeItems.length > 0) {
                await tx.recipeItem.createMany({
                    data: recipeItems.map(item => ({
                        ...item,
                        productId: id
                    }))
                });
            }
            if (packagingUsages.length > 0) {
                await tx.packagingUsage.createMany({
                    data: packagingUsages.map(usage => ({
                        ...usage,
                        productId: id
                    }))
                });
            }
            if (laborCostPreset) {
                await tx.laborCostPreset.create({
                    data: {
                        name: laborCostPreset.name,
                        minutesPerBatch: laborCostPreset.minutesPerBatch,
                        batchYield: laborCostPreset.batchYield,
                        laborRatePerHour: laborCostPreset.laborRatePerHour,
                        productId: id
                    }
                });
            }
        });
        res.json({ message: 'Receita atualizada com sucesso' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProductRecipe = updateProductRecipe;
const getPricingPreview = async (req, res, next) => {
    try {
        const { productId } = req.query;
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
        product.recipeItems.forEach(item => {
            const wasteFactor = 1 + (item.wastePct || 0) / 100;
            ingredientsCost += item.qty * item.ingredient.costPerUnit * wasteFactor;
        });
        let packagingCost = 0;
        product.packagingUsages.forEach(usage => {
            packagingCost += usage.qty * usage.packaging.unitCost;
        });
        let laborCost = 0;
        if (product.laborCostPreset) {
            laborCost = (0, pricing_1.calculateLaborCost)(product.laborCostPreset.minutesPerBatch, product.laborCostPreset.batchYield, product.laborCostPreset.laborRatePerHour);
        }
        const totalUnitCost = ingredientsCost + packagingCost + laborCost;
        const directPrice = product.channelBasePriceDirect || totalUnitCost * 2;
        const iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
        const iFoodPrice = product.channelBasePriceIFood || (0, pricing_1.calculateIFoodPrice)(directPrice, iFoodFeePercent);
        const pricingPreview = {
            productId: product.id,
            productName: product.name,
            ingredientsCost: Math.round(ingredientsCost * 100) / 100,
            packagingCost: Math.round(packagingCost * 100) / 100,
            laborCost: Math.round(laborCost * 100) / 100,
            totalUnitCost: Math.round(totalUnitCost * 100) / 100,
            suggestedPriceDirect: Math.round(directPrice * 100) / 100,
            suggestedPriceIFood: Math.round(iFoodPrice * 100) / 100,
            marginDirect: (0, pricing_1.calculateMargin)(directPrice, totalUnitCost),
            marginIFood: (0, pricing_1.calculateMargin)(iFoodPrice * (1 - iFoodFeePercent / 100), totalUnitCost)
        };
        res.json(pricingPreview);
    }
    catch (error) {
        next(error);
    }
};
exports.getPricingPreview = getPricingPreview;
//# sourceMappingURL=products.controller.js.map