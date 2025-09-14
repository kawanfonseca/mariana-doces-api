const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Importar rotas (assumindo que serão compiladas para CommonJS)
const { authRouter } = require('../dist/routes/auth.routes');
const { ingredientsRouter } = require('../dist/routes/ingredients.routes');
const { packagingRouter } = require('../dist/routes/packaging.routes');
const { productsRouter } = require('../dist/routes/products.routes');
const { ordersRouter } = require('../dist/routes/orders.routes');
const { reportsRouter } = require('../dist/routes/reports.routes');
const { configRouter } = require('../dist/routes/config.routes');
const { importRouter } = require('../dist/routes/import.routes');
const { errorHandler } = require('../dist/middlewares/error.middleware');
const { authMiddleware } = require('../dist/middlewares/auth.middleware');

dotenv.config();

const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
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

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'Mariana Doces API', version: '1.0.0' });
});

// Para desenvolvimento local
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

// Para Vercel
module.exports = app;
