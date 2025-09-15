import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, CreateStockMovementDto, InventoryStatusDto, StockAlertDto, ProductCostAnalysisDto } from '../types';

export const getStockMovements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, ingredientId } = req.query as any;
    const skip = (page - 1) * limit;

    const where = {
      ...(ingredientId && { ingredientId })
    };

    const [stockMovements, total] = await Promise.all([
      prisma.stockMovement.findMany({
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
      prisma.stockMovement.count({ where })
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
  } catch (error) {
    next(error);
  }
};

export const getStockMovement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const stockMovement = await prisma.stockMovement.findUnique({
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
  } catch (error) {
    next(error);
  }
};

export const createStockMovement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: CreateStockMovementDto = req.body;

    // Verificar se o ingrediente existe
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: data.ingredientId }
    });

    if (!ingredient) {
      res.status(404).json({ error: 'Ingrediente não encontrado' });
      return;
    }

    // Verificar estoque para saídas
    if (data.type === 'OUT' && ingredient.currentStock < data.quantity) {
      res.status(400).json({
        error: 'Estoque insuficiente',
        details: `Estoque atual: ${ingredient.currentStock} ${ingredient.unit}`
      });
      return;
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar movimentação
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

      // Atualizar estoque do ingrediente
      let stockChange = 0;
      switch (data.type) {
        case 'IN':
          stockChange = data.quantity;
          break;
        case 'OUT':
          stockChange = -data.quantity;
          break;
        case 'ADJUSTMENT':
          // Para ajustes, a quantidade é o novo valor total
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
  } catch (error) {
    next(error);
  }
};

export const getInventoryStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    const status: InventoryStatusDto = {
      total: ingredients.length,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      ingredients: []
    };

    for (const ingredient of ingredients) {
      let stockStatus: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'OK';
      
      if (ingredient.currentStock <= 0) {
        stockStatus = 'OUT_OF_STOCK';
        status.outOfStock++;
      } else if (ingredient.currentStock <= ingredient.minStock) {
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
  } catch (error) {
    next(error);
  }
};

export const getStockAlerts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: {
        active: true,
        OR: [
          { currentStock: { lte: 0 } },
          {
            AND: [
              { currentStock: { gt: 0 } },
              { currentStock: { lte: prisma.ingredient.fields.minStock } }
            ]
          }
        ]
      },
      orderBy: { currentStock: 'asc' }
    });

    const alerts: StockAlertDto[] = ingredients.map(ingredient => ({
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
  } catch (error) {
    next(error);
  }
};

export const getCostAnalysis = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
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

    const analysis: ProductCostAnalysisDto[] = products.map(product => {
      let ingredientsCost = 0;
      let packagingCost = 0;
      let laborCost = 0;

      // Calcular custo dos ingredientes
      product.recipeItems.forEach(item => {
        const wasteFactor = 1 + (item.wastePct || 0) / 100;
        ingredientsCost += item.qty * item.ingredient.costPerUnit * wasteFactor;
      });

      // Calcular custo das embalagens
      product.packagingUsages.forEach(usage => {
        packagingCost += usage.qty * usage.packaging.unitCost;
      });

      // Calcular custo da mão de obra
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
  } catch (error) {
    next(error);
  }
};
