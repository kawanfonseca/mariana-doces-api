import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { hashPassword } from '../utils/password';
import { CreateUserDto, UserRole } from '../types';

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('👤 [CREATE_USER] Iniciando criação de usuário...');
    console.log('👤 [CREATE_USER] Body recebido:', req.body);
    
    const { email, password, name, role }: CreateUserDto = req.body;
    
    console.log('👤 [CREATE_USER] Email:', email);
    console.log('👤 [CREATE_USER] Nome:', name);
    console.log('👤 [CREATE_USER] Role:', role);

    // Verificar se usuário já existe
    console.log('👤 [CREATE_USER] Verificando se usuário já existe...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ [CREATE_USER] Usuário já existe:', email);
      res.status(409).json({ 
        success: false,
        error: 'Usuário já existe com este email',
        field: 'email'
      });
      return;
    }

    // Hash da senha
    console.log('👤 [CREATE_USER] Gerando hash da senha...');
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    console.log('👤 [CREATE_USER] Criando usuário no banco...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'OPERATOR',
        active: true
      }
    });

    console.log('✅ [CREATE_USER] Usuário criado com sucesso:', user.email);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ [CREATE_USER] Erro na criação:', error);
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('👥 [LIST_USERS] Listando usuários...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ [LIST_USERS] Usuários encontrados:', users.length);

    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('❌ [LIST_USERS] Erro ao listar usuários:', error);
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log('👤 [GET_USER] Buscando usuário:', id);
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    console.log('✅ [GET_USER] Usuário encontrado:', user.email);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ [GET_USER] Erro ao buscar usuário:', error);
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, active } = req.body;
    
    console.log('👤 [UPDATE_USER] Atualizando usuário:', id);
    console.log('👤 [UPDATE_USER] Dados para atualizar:', { name, role, active });
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(active !== undefined && { active })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('✅ [UPDATE_USER] Usuário atualizado:', user.email);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user
    });
  } catch (error) {
    console.error('❌ [UPDATE_USER] Erro ao atualizar usuário:', error);
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ [DELETE_USER] Deletando usuário:', id);
    
    await prisma.user.delete({
      where: { id }
    });

    console.log('✅ [DELETE_USER] Usuário deletado com sucesso');

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ [DELETE_USER] Erro ao deletar usuário:', error);
    next(error);
  }
};
