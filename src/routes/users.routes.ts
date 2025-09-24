import { Router } from 'express';
import { 
  createUser, 
  listUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/users.controller';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { createUserSchema, idParamSchema } from '../utils/schemas';

export const usersRouter = Router();

// Criar usuário (público para facilitar setup inicial)
usersRouter.post('/', validateBody(createUserSchema), createUser);

// Listar usuários (admin apenas)
usersRouter.get('/', requireRole(['ADMIN']), listUsers);

// Obter usuário por ID (admin apenas)
usersRouter.get('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), getUserById);

// Atualizar usuário (admin apenas)
usersRouter.put('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), updateUser);

// Deletar usuário (admin apenas)
usersRouter.delete('/:id', requireRole(['ADMIN']), validateParams(idParamSchema), deleteUser);
