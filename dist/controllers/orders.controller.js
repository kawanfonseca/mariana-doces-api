"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const database_1 = require("../services/database");
const getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, dateFrom, dateTo, channel } = req.query;
        const skip = (page - 1) * limit;
        const where = {};
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom)
                where.date.gte = new Date(dateFrom);
            if (dateTo)
                where.date.lte = new Date(dateTo);
        }
        if (channel) {
            where.channel = channel;
        }
        const [orders, total] = await Promise.all([
            database_1.prisma.saleOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    items: {
                        include: {
                            product: { select: { id: true, name: true } },
                            variant: { select: { id: true, name: true } }
                        }
                    }
                }
            }),
            database_1.prisma.saleOrder.count({ where })
        ]);
        res.json({
            data: orders,
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
exports.getOrders = getOrders;
const getOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await database_1.prisma.saleOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true } },
                        variant: { select: { id: true, name: true } }
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrder = getOrder;
const createOrder = async (req, res, next) => {
    try {
        const orderData = req.body;
        const iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
        const order = await database_1.prisma.$transaction(async (tx) => {
            let grossAmount = 0;
            const items = [];
            for (const item of orderData.items) {
                const lineGross = item.qty * item.unitPrice;
                const lineDiscount = 0;
                const lineNet = lineGross - lineDiscount;
                grossAmount += lineGross;
                items.push({
                    ...item,
                    lineGross,
                    lineDiscount,
                    lineNet
                });
            }
            const discounts = orderData.discounts || 0;
            const platformFees = orderData.channel === 'IFOOD' ? (grossAmount - discounts) * (iFoodFeePercent / 100) : 0;
            let totalCosts = 0;
            for (const item of orderData.items) {
                if (item.productId) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                        include: {
                            recipeItems: {
                                include: { ingredient: true }
                            },
                            packagingUsages: {
                                include: { packaging: true }
                            },
                            laborCostPreset: true
                        }
                    });
                    if (product) {
                        let unitCost = 0;
                        product.recipeItems.forEach(recipeItem => {
                            const wasteFactor = 1 + (recipeItem.wastePct || 0) / 100;
                            unitCost += recipeItem.qty * recipeItem.ingredient.costPerUnit * wasteFactor;
                        });
                        product.packagingUsages.forEach(usage => {
                            unitCost += usage.qty * usage.packaging.unitCost;
                        });
                        if (product.laborCostPreset) {
                            const hoursPerBatch = product.laborCostPreset.minutesPerBatch / 60;
                            const laborCostPerUnit = (hoursPerBatch * product.laborCostPreset.laborRatePerHour) / product.laborCostPreset.batchYield;
                            unitCost += laborCostPerUnit;
                        }
                        totalCosts += unitCost * item.qty;
                        await tx.costSnapshot.create({
                            data: {
                                productId: item.productId,
                                ingredientsCost: product.recipeItems.reduce((sum, ri) => {
                                    const wasteFactor = 1 + (ri.wastePct || 0) / 100;
                                    return sum + (ri.qty * ri.ingredient.costPerUnit * wasteFactor);
                                }, 0),
                                packagingCost: product.packagingUsages.reduce((sum, pu) => sum + (pu.qty * pu.packaging.unitCost), 0),
                                laborCost: product.laborCostPreset ?
                                    (product.laborCostPreset.minutesPerBatch / 60 * product.laborCostPreset.laborRatePerHour) / product.laborCostPreset.batchYield : 0,
                                overheadCost: 0,
                                totalUnitCost: unitCost
                            }
                        });
                    }
                }
            }
            const netAmount = grossAmount - discounts - platformFees;
            const newOrder = await tx.saleOrder.create({
                data: {
                    date: new Date(orderData.date),
                    channel: orderData.channel,
                    grossAmount,
                    discounts,
                    platformFees,
                    costs: totalCosts,
                    netAmount,
                    notes: orderData.notes,
                    customerName: orderData.customerName,
                    customerPhone: orderData.customerPhone,
                    items: {
                        createMany: {
                            data: items
                        }
                    }
                },
                include: {
                    items: {
                        include: {
                            product: { select: { id: true, name: true } },
                            variant: { select: { id: true, name: true } }
                        }
                    }
                }
            });
            return newOrder;
        });
        res.status(201).json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes, customerName, customerPhone } = req.body;
        const order = await database_1.prisma.saleOrder.update({
            where: { id },
            data: {
                notes,
                customerName,
                customerPhone,
                updatedAt: new Date()
            },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true } },
                        variant: { select: { id: true, name: true } }
                    }
                }
            }
        });
        res.json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        await database_1.prisma.saleOrder.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=orders.controller.js.map