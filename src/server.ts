import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { ingredientsRouter } from './routes/ingredients.routes';
import { packagingRouter } from './routes/packaging.routes';
import { productsRouter } from './routes/products.routes';
import { ordersRouter } from './routes/orders.routes';
import { reportsRouter } from './routes/reports.routes';
import { configRouter } from './routes/config.routes';
import { importRouter } from './routes/import.routes';
import stockRouter from './routes/stock.routes';
import recipesRouter from './routes/recipes.routes';
import inventoryReportsRouter from './routes/inventory-reports.routes';
import inventoryAdvancedRouter from './routes/inventory-advanced.routes';
import { debugRouter } from './routes/debug.routes';
import { debugPageRouter } from './routes/debug-page.routes';
import { usersRouter } from './routes/users.routes';
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

dotenv.config();

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Variável de ambiente obrigatória não definida: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas por janela
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares globais
app.use(helmet());

// Configuração de CORS mais flexível
const allowedOrigins = [
  'https://mariana-doces-app.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rotas públicas (com rate limiting)
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/users', usersRouter);
app.use('/api/debug', debugRouter);
app.use('/api/debug-page', debugPageRouter);

// Middleware de autenticação para rotas protegidas
app.use('/api', authMiddleware);

// Rotas protegidas
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/packaging', packagingRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/config', configRouter);
app.use('/api/import', importRouter);
app.use('/api/stock', stockRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/inventory/reports', inventoryReportsRouter);
app.use('/api/inventory/advanced', inventoryAdvancedRouter);

// Middleware de tratamento de erros
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor apenas se não estiver sendo executado pelo Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Exportar app para Vercel
export default app;
