"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const database_1 = require("../services/database");
const pricing_1 = require("../utils/pricing");
const getOrders = async (req, res, next) => {
    try {
        const { dateFrom, dateTo, channel } = req.query;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
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
            res.status(404).json({ error: 'Pedido não encontrado' });
            return;
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
        let iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
        try {
            const config = await database_1.prisma.config.findUnique({ where: { key: 'IFOOD_FEE_PERCENT' } });
            if (config) {
                iFoodFeePercent = parseFloat(config.value) || iFoodFeePercent;
            }
        }
        catch {
        }
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
                        const costs = (0, pricing_1.calculateProductCost)(product);
                        totalCosts += costs.totalUnitCost * item.qty;
                        await tx.costSnapshot.create({
                            data: {
                                productId: item.productId,
                                ingredientsCost: costs.ingredientsCost,
                                packagingCost: costs.packagingCost,
                                laborCost: costs.laborCost,
                                overheadCost: costs.overheadCost,
                                totalUnitCost: costs.totalUnitCost
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