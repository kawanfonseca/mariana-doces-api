import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, ConfigDto } from '../types';

export const getConfigs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const configs = await prisma.config.findMany({
      orderBy: { key: 'asc' }
    });

    // Converter para objeto para facilitar o uso no frontend
    const configObject = configs.reduce((acc: Record<string, { value: string; description?: string }>, config) => {
      acc[config.key] = {
        value: config.value,
        ...(config.description && { description: config.description })
      };
      return acc;
    }, {} as Record<string, { value: string; description?: string }>);

    res.json(configObject);
  } catch (error) {
    next(error);
  }
};

export const updateConfig = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { key, value, description }: ConfigDto = req.body;

    const config = await prisma.config.upsert({
      where: { key },
      update: { 
        value, 
        description: description || null 
      },
      create: { 
        key, 
        value, 
        description: description || null 
      }
    });

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const initializeDefaultConfigs = async () => {
  const defaultConfigs = [
    {
      key: 'IFOOD_FEE_PERCENT',
      value: process.env.IFOOD_FEE_PERCENT || '25',
      description: 'Taxa do iFood em porcentagem'
    },
    {
      key: 'DEFAULT_LABOR_RATE_PER_HOUR',
      value: process.env.DEFAULT_LABOR_RATE_PER_HOUR || '20.00',
      description: 'Taxa padrão de mão de obra por hora em reais'
    },
    {
      key: 'DEFAULT_MARGIN_PERCENT',
      value: '100',
      description: 'Margem padrão sugerida em porcentagem'
    },
    {
      key: 'CURRENCY_SYMBOL',
      value: 'R$',
      description: 'Símbolo da moeda'
    }
  ];

  for (const config of defaultConfigs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: {},
      create: config
    });
  }
};
