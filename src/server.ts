import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas
app.use('/api/auth', authRouter);
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
