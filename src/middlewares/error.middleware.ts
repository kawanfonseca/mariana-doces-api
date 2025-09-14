import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Erro de validação Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Erros do Prisma
  if (error.code && typeof error.code === 'string') {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Recurso já existe',
          details: 'Violação de restrição única'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Recurso não encontrado'
        });
      default:
        return res.status(500).json({
          error: 'Erro interno do servidor',
          details: 'Erro no banco de dados'
        });
    }
  }

  // Erro de validação customizado
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.message
    });
  }

  // Erro de autorização
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Não autorizado'
    });
  }

  // Erro genérico
  return res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
