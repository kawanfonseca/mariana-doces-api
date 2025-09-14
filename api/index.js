// Handler para Vercel Functions
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Importar as rotas compiladas
const authRoutes = require('../dist/routes/auth.routes');
const ingredientsRoutes = require('../dist/routes/ingredients.routes');
const packagingRoutes = require('../dist/routes/packaging.routes');
const productsRoutes = require('../dist/routes/products.routes');
const ordersRoutes = require('../dist/routes/orders.routes');
const reportsRoutes = require('../dist/routes/reports.routes');
const configRoutes = require('../dist/routes/config.routes');
const importRoutes = require('../dist/routes/import.routes');
const errorHandler = require('../dist/middlewares/error.middleware');
const authMiddleware = require('../dist/middlewares/auth.middleware');

const app = express();

// Middlewares globais
app.use(helmet());

// Configuração de CORS
const allowedOrigins = [
  'https://mariana-doces-app.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

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
app.use('/api/auth', authRoutes.authRouter);

// Middleware de autenticação para rotas protegidas
app.use('/api', authMiddleware.authMiddleware);

// Rotas protegidas
app.use('/api/ingredients', ingredientsRoutes.ingredientsRouter);
app.use('/api/packaging', packagingRoutes.packagingRouter);
app.use('/api/products', productsRoutes.productsRouter);
app.use('/api/orders', ordersRoutes.ordersRouter);
app.use('/api/reports', reportsRoutes.reportsRouter);
app.use('/api/config', configRoutes.configRouter);
app.use('/api/import', importRoutes.importRouter);

// Middleware de tratamento de erros
app.use(errorHandler.errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Exportar para Vercel
module.exports = app;
