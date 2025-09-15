import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest } from '../types';

// Relatório de movimentações de estoque
export const getStockMovementsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, ingredientId, type } = req.query as any;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (ingredientId) {
      where.ingredientId = ingredientId;
    }

    if (type) {
      where.type = type;
    }

    const movements = await prisma.stockMovement.findMany({
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

    // Calcular totais
    const totals = movements.reduce((acc, movement) => {
      const value = movement.quantity * movement.ingredient.costPerUnit;
      
      if (movement.type === 'IN') {
        acc.totalIn += movement.quantity;
        acc.totalInValue += value;
      } else if (movement.type === 'OUT') {
        acc.totalOut += movement.quantity;
        acc.totalOutValue += value;
      } else if (movement.type === 'ADJUSTMENT') {
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
  } catch (error) {
    next(error);
  }
};

// Relatório de valor em estoque
export const getInventoryValueReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { category, minValue, maxValue } = req.query as any;

    const where: any = { active: true };

    if (minValue || maxValue) {
      where.currentStock = {};
      if (minValue) where.currentStock.gte = parseFloat(minValue);
      if (maxValue) where.currentStock.lte = parseFloat(maxValue);
    }

    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    // Calcular valores
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

    // Totais por categoria
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
  } catch (error) {
    next(error);
  }
};

// Relatório de ingredientes mais utilizados
export const getMostUsedIngredientsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, limit = 10 } = req.query as any;

    // Buscar movimentações de saída (uso em produção)
    const where: any = { type: 'OUT' };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const movements = await prisma.stockMovement.findMany({
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

    // Agrupar por ingrediente
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

    // Converter para array e ordenar por quantidade
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
  } catch (error) {
    next(error);
  }
};

// Previsão de estoque baseada em receitas
export const getStockForecastReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query as any;

    // Buscar vendas dos últimos 30 dias para calcular média de uso
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.saleItem.findMany({
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

    // Calcular uso de ingredientes baseado nas vendas
    const ingredientUsage = new Map();

    recentSales.forEach(saleItem => {
      if (!saleItem.product?.recipeItems) return;

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

    // Calcular previsão
    const forecast = Array.from(ingredientUsage.values()).map(usage => {
      const dailyAverage = usage.totalUsed / 30; // média dos últimos 30 dias
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
  } catch (error) {
    next(error);
  }
};

// Exportar relatório de estoque para CSV
export const exportInventoryCSV = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, type } = req.query as any;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (type) {
      where.type = type;
    }

    const movements = await prisma.stockMovement.findMany({
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

    // Gerar CSV
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
  } catch (error) {
    next(error);
  }
};

// Relatório de rotatividade de estoque
export const getStockTurnoverReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { period = 30 } = req.query as any;

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Buscar movimentações do período
    const movements = await prisma.stockMovement.findMany({
      where: {
        date: { gte: startDate }
      },
      include: {
        ingredient: true
      }
    });

    // Calcular rotatividade por ingrediente
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
      } else if (movement.type === 'OUT') {
        turnover.totalOut += movement.quantity;
      }
    });

    // Calcular índices de rotatividade
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
  } catch (error) {
    next(error);
  }
};
