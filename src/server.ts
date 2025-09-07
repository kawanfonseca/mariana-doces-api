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
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas
app.use('/api/auth', authRouter);

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

// Middleware de tratamento de erros
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
