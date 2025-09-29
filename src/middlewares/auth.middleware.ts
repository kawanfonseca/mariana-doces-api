import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Usuário padrão sempre logado
    req.user = {
      id: '671dd650-0eab-4909-8d15-e356c8c5cac0',
      email: 'kawanfonseca@hotmail.com',
      role: 'ADMIN'
    };
    
    console.log('🔐 [AUTH] Usuário padrão logado:', req.user.email);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Erro de autenticação' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return;
    }

    next();
  };
};
