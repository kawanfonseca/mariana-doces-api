import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, CreateProductDto, UpdateProductDto, ProductRecipeDto, PricingPreview } from '../types';
import { calculateLaborCost, calculateMargin, calculateIFoodPrice } from '../utils/pricing';

export const getProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search } = req.query as any;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const
        }
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          variants: true,
          laborCostPreset: true
        }
      }),
      prisma.product.count({ where })
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
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data: CreateProductDto = req.body;

    const product = await prisma.product.create({
      data
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: UpdateProductDto = req.body;

    const product = await prisma.product.update({
      where: { id },
      data
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar se o produto tem vendas
    const salesCount = await prisma.saleItem.count({
      where: { productId: id }
    });

    if (salesCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir produto que possui vendas registradas'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getProductRecipe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      recipeItems: product.recipeItems,
      packagingUsages: product.packagingUsages,
      laborCostPreset: product.laborCostPreset
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductRecipe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { recipeItems, packagingUsages, laborCostPreset }: ProductRecipeDto = req.body;

    await prisma.$transaction(async (tx) => {
      // Remover receita existente
      await tx.recipeItem.deleteMany({
        where: { productId: id }
      });

      await tx.packagingUsage.deleteMany({
        where: { productId: id }
      });

      await tx.laborCostPreset.deleteMany({
        where: { productId: id }
      });

      // Criar nova receita
      if (recipeItems.length > 0) {
        await tx.recipeItem.createMany({
          data: recipeItems.map(item => ({
            ...item,
            productId: id as string
          }))
        });
      }

      if (packagingUsages.length > 0) {
        await tx.packagingUsage.createMany({
          data: packagingUsages.map(usage => ({
            ...usage,
            productId: id as string
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
            productId: id as string
          }
        });
      }
    });

    res.json({ message: 'Receita atualizada com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const getPricingPreview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.query as { productId: string };

    const product = await prisma.product.findUnique({
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

    // Calcular custos
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
      laborCost = calculateLaborCost(
        product.laborCostPreset.minutesPerBatch,
        product.laborCostPreset.batchYield,
        product.laborCostPreset.laborRatePerHour
      );
    }

    const totalUnitCost = ingredientsCost + packagingCost + laborCost;

    // Preços sugeridos
    const directPrice = product.channelBasePriceDirect || totalUnitCost * 2;
    const iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
    const iFoodPrice = product.channelBasePriceIFood || calculateIFoodPrice(directPrice, iFoodFeePercent);

    const pricingPreview: PricingPreview = {
      productId: product.id,
      productName: product.name,
      ingredientsCost: Math.round(ingredientsCost * 100) / 100,
      packagingCost: Math.round(packagingCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      totalUnitCost: Math.round(totalUnitCost * 100) / 100,
      suggestedPriceDirect: Math.round(directPrice * 100) / 100,
      suggestedPriceIFood: Math.round(iFoodPrice * 100) / 100,
      marginDirect: calculateMargin(directPrice, totalUnitCost),
      marginIFood: calculateMargin(iFoodPrice * (1 - iFoodFeePercent / 100), totalUnitCost)
    };

    res.json(pricingPreview);
  } catch (error) {
    next(error);
  }
};
