import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { CreateUserDto, LoginDto, UserRole } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔐 [LOGIN] Iniciando processo de login...');
    console.log('🔐 [LOGIN] Body recebido:', req.body);
    
    const { email, password }: LoginDto = req.body;
    
    console.log('🔐 [LOGIN] Email:', email);
    console.log('🔐 [LOGIN] Password presente:', !!password);

    // Buscar usuário
    console.log('🔐 [LOGIN] Buscando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email, active: true }
    });

    console.log('🔐 [LOGIN] Usuário encontrado:', !!user);
    if (user) {
      console.log('🔐 [LOGIN] Usuário ativo:', user.active);
      console.log('🔐 [LOGIN] Role do usuário:', user.role);
    }

    if (!user) {
      console.log('❌ [LOGIN] Usuário não encontrado ou inativo');
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Verificar senha
    console.log('🔐 [LOGIN] Verificando senha...');
    const isValidPassword = await comparePassword(password, user.password);
    console.log('🔐 [LOGIN] Senha válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ [LOGIN] Senha inválida');
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Gerar token
    console.log('🔐 [LOGIN] Gerando token...');
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole
    });
    
    console.log('✅ [LOGIN] Login realizado com sucesso para:', user.email);

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
