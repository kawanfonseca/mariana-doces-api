import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, CreatePackagingDto, UpdatePackagingDto } from '../types';

export const getPackaging = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const [packaging, total] = await Promise.all([
      prisma.packaging.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.packaging.count({ where })
    ]);

    res.json({
      data: packaging,
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

export const getPackagingById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const packaging = await prisma.packaging.findUnique({
      where: { id },
      include: {
        packagingUsages: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!packaging) {
      return res.status(404).json({ error: 'Embalagem não encontrada' });
    }

    res.json(packaging);
  } catch (error) {
    next(error);
  }
};

export const createPackaging = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data: CreatePackagingDto = req.body;

    const packaging = await prisma.packaging.create({
      data
    });

    res.status(201).json(packaging);
  } catch (error) {
    next(error);
  }
};

export const updatePackaging = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: UpdatePackagingDto = req.body;

    const packaging = await prisma.packaging.update({
      where: { id },
      data
    });

    res.json(packaging);
  } catch (error) {
    next(error);
  }
};

export const deletePackaging = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar se a embalagem está sendo usada
    const usageCount = await prisma.packagingUsage.count({
      where: { packagingId: id }
    });

    if (usageCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir embalagem que está sendo usada em produtos'
      });
    }

    await prisma.packaging.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
