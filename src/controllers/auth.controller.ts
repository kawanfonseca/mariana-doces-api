import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { CreateUserDto, LoginDto, UserRole } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔐 [LOGIN] Login automático - usuário padrão');
    
    // Sempre retornar sucesso com usuário padrão
    const user = {
      id: '671dd650-0eab-4909-8d15-e356c8c5cac0',
      email: 'kawanfonseca@hotmail.com',
      name: 'Kawan Fonseca',
      role: 'ADMIN'
    };

    // Gerar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole
    });
    
    console.log('✅ [LOGIN] Login automático realizado para:', user.email);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ [LOGIN] Erro no login:', error);
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role }: CreateUserDto = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ error: 'Usuário já existe' });
      return;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'OPERATOR'
      }
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
