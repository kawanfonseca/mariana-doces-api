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
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_middleware_1 = require("./middlewares/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api', auth_middleware_1.authMiddleware);
app.use('/api/ingredients', ingredients_routes_1.ingredientsRouter);
app.use('/api/packaging', packaging_routes_1.packagingRouter);
app.use('/api/products', products_routes_1.productsRouter);
app.use('/api/orders', orders_routes_1.ordersRouter);
app.use('/api/reports', reports_routes_1.reportsRouter);
app.use('/api/config', config_routes_1.configRouter);
app.use('/api/import', import_routes_1.importRouter);
app.use(error_middleware_1.errorHandler);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=server.js.map