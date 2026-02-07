import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, CreateSaleOrderDto } from '../types';
import { calculateProductCost } from '../utils/pricing';

export const getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, channel } = req.query as any;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 20), 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (channel) {
      where.channel = channel;
    }

    const [orders, total] = await Promise.all([
      prisma.saleOrder.findMany({
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
      prisma.saleOrder.count({ where })
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
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.saleOrder.findUnique({
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
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderData: CreateSaleOrderDto = req.body;

    // Buscar taxa iFood da tabela Config, com fallback para env var
    let iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
    try {
      const config = await prisma.config.findUnique({ where: { key: 'IFOOD_FEE_PERCENT' } });
      if (config) {
        iFoodFeePercent = parseFloat(config.value) || iFoodFeePercent;
      }
    } catch {
      // Usa fallback do env var
    }

    const order = await prisma.$transaction(async (tx) => {
      // Calcular totais
      let grossAmount = 0;
      const items: any[] = [];

      for (const item of orderData.items) {
        const lineGross = item.qty * item.unitPrice;
        const lineDiscount = 0; // Por enquanto sem desconto por item
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

      // Calcular custos baseado nos produtos
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
            const costs = calculateProductCost(product);
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

      // Criar o pedido
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
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { notes, customerName, customerPhone } = req.body;

    const order = await prisma.saleOrder.update({
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
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.saleOrder.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
