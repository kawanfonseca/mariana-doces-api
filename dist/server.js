"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = require("./routes/auth.routes");
const ingredients_routes_1 = require("./routes/ingredients.routes");
const packaging_routes_1 = require("./routes/packaging.routes");
const products_routes_1 = require("./routes/products.routes");
const orders_routes_1 = require("./routes/orders.routes");
const reports_routes_1 = require("./routes/reports.routes");
const config_routes_1 = require("./routes/config.routes");
const import_routes_1 = require("./routes/import.routes");
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
const recipes_routes_1 = __importDefault(require("./routes/recipes.routes"));
const inventory_reports_routes_1 = __importDefault(require("./routes/inventory-reports.routes"));
const inventory_advanced_routes_1 = __importDefault(require("./routes/inventory-advanced.routes"));
const debug_routes_1 = require("./routes/debug.routes");
const debug_page_routes_1 = require("./routes/debug-page.routes");
const users_routes_1 = require("./routes/users.routes");
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_middleware_1 = require("./middlewares/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
const allowedOrigins = [
    'https://mariana-doces-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.CORS_ORIGIN
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/users', users_routes_1.usersRouter);
app.use('/api/debug', debug_routes_1.debugRouter);
app.use('/api/debug-page', debug_page_routes_1.debugPageRouter);
app.use('/api', auth_middleware_1.authMiddleware);
app.use('/api/ingredients', ingredients_routes_1.ingredientsRouter);
app.use('/api/packaging', packaging_routes_1.packagingRouter);
app.use('/api/products', products_routes_1.productsRouter);
app.use('/api/orders', orders_routes_1.ordersRouter);
app.use('/api/reports', reports_routes_1.reportsRouter);
app.use('/api/config', config_routes_1.configRouter);
app.use('/api/import', import_routes_1.importRouter);
app.use('/api/stock', stock_routes_1.default);
app.use('/api/recipes', recipes_routes_1.default);
app.use('/api/inventory/reports', inventory_reports_routes_1.default);
app.use('/api/inventory/advanced', inventory_advanced_routes_1.default);
app.use(error_middleware_1.errorHandler);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map