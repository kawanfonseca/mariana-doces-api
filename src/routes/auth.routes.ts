import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginSchema, createUserSchema } from '../utils/schemas';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/register', validateBody(createUserSchema), register);
authRouter.get('/me', authMiddleware, me);
