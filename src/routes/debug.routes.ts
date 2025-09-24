import { Router } from 'express';
import { debugLogin, debugEnvironment } from '../controllers/debug.controller';

export const debugRouter = Router();

// Rota para debug do login
debugRouter.post('/login', debugLogin);

// Rota para verificar ambiente
debugRouter.get('/environment', debugEnvironment);

// Rota para testar conexão com banco
debugRouter.get('/database', async (req, res) => {
  try {
    const { prisma } = await import('../services/database');
    await prisma.$connect();
    
    const userCount = await prisma.user.count();
    const ingredientsCount = await prisma.ingredient.count();
    
    res.json({
      success: true,
      database: {
        connected: true,
        userCount,
        ingredientsCount
      }
    });
  } catch (error) {
    res.json({
      success: false,
      database: {
        connected: false,
        error: error instanceof Error ? error.message : String(error)
      }
    });
  }
});
