import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, CreateIngredientDto, UpdateIngredientDto } from '../types';

export const getIngredients = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.ingredient.count({ where })
    ]);

    res.json({
      data: ingredients,
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

export const getIngredient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        recipeItems: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingrediente não encontrado' });
    }

    res.json(ingredient);
  } catch (error) {
    next(error);
  }
};

export const createIngredient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data: CreateIngredientDto = req.body;

    const ingredient = await prisma.ingredient.create({
      data
    });

    res.status(201).json(ingredient);
  } catch (error) {
    next(error);
  }
};

export const updateIngredient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: UpdateIngredientDto = req.body;

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data
    });

    res.json(ingredient);
  } catch (error) {
    next(error);
  }
};

export const deleteIngredient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar se o ingrediente está sendo usado em receitas
    const usageCount = await prisma.recipeItem.count({
      where: { ingredientId: id }
    });

    if (usageCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir ingrediente que está sendo usado em receitas'
      });
    }

    await prisma.ingredient.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
