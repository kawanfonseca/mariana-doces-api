import { Router } from 'express';
import path from 'path';

export const debugPageRouter = Router();

// Servir a página de debug
debugPageRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../test-debug.html'));
});

// Servir a página de gerenciamento de usuários
debugPageRouter.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../../user-management.html'));
});

// Endpoint para obter o HTML da página de debug
debugPageRouter.get('/html', (req, res) => {
  res.json({
    message: 'Página de debug disponível em /api/debug-page',
    url: `${req.protocol}://${req.get('host')}/api/debug-page`
  });
});
