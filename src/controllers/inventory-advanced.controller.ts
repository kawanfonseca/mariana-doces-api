import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest } from '../types';

// Ajuste de estoque em lote
export const bulkStockAdjustment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { adjustments, reason, notes } = req.body;

    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ error: 'Lista de ajustes é obrigatória' });
    }

    const results = await prisma.$transaction(async (tx) => {
      const createdMovements = [];

      for (const adjustment of adjustments) {
        const { ingredientId, newStock } = adjustment;

        // Verificar se o ingrediente existe
        const ingredient = await tx.ingredient.findUnique({
          where: { id: ingredientId }
        });

        if (!ingredient) {
          throw new Error(`Ingrediente não encontrado: ${ingredientId}`);
        }

        // Criar movimentação de ajuste
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

        // Atualizar estoque
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
  } catch (error) {
    next(error);
  }
};

// Transferência de estoque entre ingredientes
export const transferStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { fromIngredientId, toIngredientId, quantity, reason, notes } = req.body;

    if (!fromIngredientId || !toIngredientId || !quantity) {
      return res.status(400).json({ 
        error: 'Ingrediente origem, destino e quantidade são obrigatórios' 
      });
    }

    if (fromIngredientId === toIngredientId) {
      return res.status(400).json({ 
        error: 'Ingrediente origem e destino devem ser diferentes' 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Verificar ingredientes
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

      // Criar movimentações
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

      // Atualizar estoques
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
  } catch (error) {
    next(error);
  }
};

// Consumo automático baseado em receitas
export const consumeIngredientsForProduction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity, reason, notes } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ 
        error: 'Produto e quantidade são obrigatórios' 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Buscar receita do produto
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

      // Processar cada ingrediente da receita
      for (const recipeItem of product.recipeItems) {
        const wasteFactor = 1 + (recipeItem.wastePct || 0) / 100;
        const totalQuantity = recipeItem.qty * quantity * wasteFactor;

        // Verificar estoque disponível
        if (recipeItem.ingredient.currentStock < totalQuantity) {
          throw new Error(
            `Estoque insuficiente de ${recipeItem.ingredient.name}. ` +
            `Necessário: ${totalQuantity} ${recipeItem.ingredient.unit}, ` +
            `Disponível: ${recipeItem.ingredient.currentStock} ${recipeItem.ingredient.unit}`
          );
        }

        // Criar movimentação de saída
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

        // Atualizar estoque
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
  } catch (error) {
    next(error);
  }
};

// Reabastecimento automático baseado em estoque mínimo
export const autoRestock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reason, notes, multiplier = 2 } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Buscar ingredientes que precisam de reabastecimento
      const ingredientsToRestock = await tx.ingredient.findMany({
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
        }
      });

      const movements = [];

      for (const ingredient of ingredientsToRestock) {
        // Calcular quantidade para reabastecer
        const targetStock = ingredient.minStock * multiplier;
        const quantityToAdd = Math.max(0, targetStock - ingredient.currentStock);

        if (quantityToAdd > 0) {
          // Criar movimentação de entrada
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

          // Atualizar estoque
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
  } catch (error) {
    next(error);
  }
};

// Histórico de movimentações por ingrediente
export const getIngredientHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { ingredientId } = req.params;
    const { page = 1, limit = 50, dateFrom, dateTo } = req.query as any;

    const skip = (page - 1) * limit;

    const where: any = { ingredientId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
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
      prisma.stockMovement.count({ where })
    ]);

    // Calcular saldo atual
    const currentStock = await prisma.ingredient.findUnique({
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
  } catch (error) {
    next(error);
  }
};

// Relatório de ingredientes próximos ao vencimento (simulado)
export const getExpiringIngredients = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query as any;

    // Simular ingredientes próximos ao vencimento baseado na última movimentação de entrada
    const recentMovements = await prisma.stockMovement.findMany({
      where: {
        type: 'IN',
        date: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // últimos 90 dias
        }
      },
      include: {
        ingredient: true
      },
      orderBy: { date: 'desc' }
    });

    // Agrupar por ingrediente e simular vencimento
    const expiringMap = new Map();

    recentMovements.forEach(movement => {
      const ingredientId = movement.ingredientId;
      
      if (!expiringMap.has(ingredientId)) {
        // Simular data de vencimento (30-90 dias após entrada)
        const expirationDate = new Date(movement.date);
        expirationDate.setDate(expirationDate.getDate() + Math.floor(Math.random() * 60) + 30);
        
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
  } catch (error) {
    next(error);
  }
};
